import os
import secrets
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Query, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from database import get_db, init_db

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="K-Drama Review Blog API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CommentCreate(BaseModel):
    author: str = "匿名用户"
    content: str


class LikeAction(BaseModel):
    user_token: str


class BlogCreate(BaseModel):
    title: str
    summary: str = ""
    content: str = ""
    tags: str = ""


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None


class ReviewCreate(BaseModel):
    drama_id: int
    author: str = "匿名用户"
    title: str
    content: str = ""
    summary: str = ""
    rating: float = 0


class ReviewUpdate(BaseModel):
    drama_id: Optional[int] = None
    author: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    rating: Optional[float] = None


class LoginBody(BaseModel):
    password: str


def verify_admin(authorization: str = Header("")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="需要登录")
    token = authorization[7:]
    conn = get_db()
    row = conn.execute("SELECT id FROM admin_tokens WHERE token = ?", (token,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Token 无效")
    return token


def _build_review_filters(genre, search):
    conditions = []
    params = []
    if genre:
        conditions.append("d.genre = ?")
        params.append(genre)
    if search:
        conditions.append("(r.title LIKE ? OR r.content LIKE ? OR d.title LIKE ?)")
        like = f"%{search}%"
        params.extend([like, like, like])
    where = "WHERE " + " AND ".join(conditions) if conditions else ""
    return where, params


@app.get("/api/genres")
def get_genres():
    conn = get_db()
    rows = conn.execute(
        "SELECT DISTINCT genre FROM dramas WHERE genre != '' ORDER BY genre"
    ).fetchall()
    conn.close()
    return {"genres": [r["genre"] for r in rows]}


@app.get("/api/dramas")
def get_dramas():
    conn = get_db()
    rows = conn.execute("SELECT * FROM dramas ORDER BY created_at DESC").fetchall()
    conn.close()
    return {"dramas": [dict(r) for r in rows]}


@app.get("/api/dramas/{drama_id}")
def get_drama(drama_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM dramas WHERE id = ?", (drama_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Drama not found")
    return {"drama": dict(row)}


@app.get("/api/reviews")
def get_reviews(
    page: int = Query(1, ge=1),
    per_page: int = Query(6, ge=1, le=50),
    genre: str = Query(""),
    search: str = Query(""),
    sort: str = Query("latest"),
):
    conn = get_db()
    where, params = _build_review_filters(genre, search)

    total_sql = f"""
        SELECT COUNT(*) as total FROM reviews r
        JOIN dramas d ON r.drama_id = d.id {where}
    """
    total = conn.execute(total_sql, params).fetchone()["total"]

    order = "r.created_at DESC"
    if sort == "popular":
        order = "r.likes_count DESC"
    elif sort == "rating":
        order = "r.rating DESC"

    offset = (page - 1) * per_page
    sql = f"""
        SELECT r.*, d.title as drama_title, d.title_ko as drama_title_ko,
               d.genre, d.poster_url, d.year, d.cast, d.director, d.writer, d.episodes
        FROM reviews r
        JOIN dramas d ON r.drama_id = d.id
        {where}
        ORDER BY {order}
        LIMIT ? OFFSET ?
    """
    rows = conn.execute(sql, params + [per_page, offset]).fetchall()
    conn.close()
    return {
        "reviews": [dict(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }


@app.get("/api/reviews/{review_id}")
def get_review(review_id: int):
    conn = get_db()
    row = conn.execute("""
        SELECT r.*, d.title as drama_title, d.title_ko as drama_title_ko,
               d.genre, d.poster_url, d.year, d.cast, d.director, d.writer, d.episodes
        FROM reviews r
        JOIN dramas d ON r.drama_id = d.id
        WHERE r.id = ?
    """, (review_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"review": dict(row)}


@app.get("/api/reviews/{review_id}/comments")
def get_comments(review_id: int):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM comments WHERE review_id = ? ORDER BY created_at DESC",
        (review_id,)
    ).fetchall()
    conn.close()
    return {"comments": [dict(r) for r in rows]}


@app.post("/api/reviews/{review_id}/comments")
def add_comment(review_id: int, body: CommentCreate):
    conn = get_db()
    review = conn.execute("SELECT id FROM reviews WHERE id = ?", (review_id,)).fetchone()
    if not review:
        conn.close()
        raise HTTPException(status_code=404, detail="Review not found")
    conn.execute(
        "INSERT INTO comments (review_id, author, content) VALUES (?, ?, ?)",
        (review_id, body.author, body.content)
    )
    conn.commit()
    row = conn.execute("SELECT * FROM comments WHERE id = last_insert_rowid()").fetchone()
    conn.close()
    return {"comment": dict(row)}


@app.post("/api/reviews/{review_id}/like")
def toggle_like(review_id: int, body: LikeAction):
    conn = get_db()
    review = conn.execute(
        "SELECT id, likes_count FROM reviews WHERE id = ?", (review_id,)
    ).fetchone()
    if not review:
        conn.close()
        raise HTTPException(status_code=404, detail="Review not found")

    existing = conn.execute(
        "SELECT id FROM likes WHERE review_id = ? AND user_token = ?",
        (review_id, body.user_token)
    ).fetchone()

    if existing:
        conn.execute("DELETE FROM likes WHERE id = ?", (existing["id"],))
        conn.execute(
            "UPDATE reviews SET likes_count = likes_count - 1 WHERE id = ?", (review_id,)
        )
        liked = False
    else:
        conn.execute(
            "INSERT INTO likes (review_id, user_token) VALUES (?, ?)",
            (review_id, body.user_token)
        )
        conn.execute(
            "UPDATE reviews SET likes_count = likes_count + 1 WHERE id = ?", (review_id,)
        )
        liked = True

    conn.commit()
    row = conn.execute(
        "SELECT likes_count FROM reviews WHERE id = ?", (review_id,)
    ).fetchone()
    conn.close()
    return {"liked": liked, "likes_count": row["likes_count"]}


# ─── Blog API ───────────────────────────────────────────────────


@app.get("/api/blog")
def get_blog_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(6, ge=1, le=50),
    tag: str = Query(""),
    search: str = Query(""),
):
    conn = get_db()
    conditions = []
    params = []
    if tag:
        conditions.append("tags LIKE ?")
        params.append(f"%{tag}%")
    if search:
        conditions.append("(title LIKE ? OR summary LIKE ?)")
        like = f"%{search}%"
        params.extend([like, like])
    where = "WHERE " + " AND ".join(conditions) if conditions else ""

    total = conn.execute(
        f"SELECT COUNT(*) as total FROM blog_posts {where}", params
    ).fetchone()["total"]

    offset = (page - 1) * per_page
    rows = conn.execute(
        f"SELECT * FROM blog_posts {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [per_page, offset],
    ).fetchall()
    conn.close()
    return {
        "posts": [dict(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }


@app.get("/api/blog/tags")
def get_blog_tags():
    conn = get_db()
    rows = conn.execute("SELECT tags FROM blog_posts").fetchall()
    conn.close()
    tag_set = set()
    for r in rows:
        for t in r["tags"].split(","):
            t = t.strip()
            if t:
                tag_set.add(t)
    return {"tags": sorted(tag_set)}


@app.get("/api/blog/{post_id}")
def get_blog_post(post_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM blog_posts WHERE id = ?", (post_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"post": dict(row)}


# ─── Admin API ──────────────────────────────────────────────────


@app.post("/api/admin/login")
def admin_login(body: LoginBody):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=403, detail="密码错误")
    token = secrets.token_hex(32)
    conn = get_db()
    conn.execute("INSERT INTO admin_tokens (token) VALUES (?)", (token,))
    conn.commit()
    conn.close()
    return {"token": token}


@app.post("/api/admin/logout")
def admin_logout(token: str = Depends(verify_admin)):
    conn = get_db()
    conn.execute("DELETE FROM admin_tokens WHERE token = ?", (token,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.post("/api/admin/reviews")
def create_review(body: ReviewCreate, token: str = Depends(verify_admin)):
    conn = get_db()
    conn.execute(
        """INSERT INTO reviews (drama_id, author, title, content, summary, rating)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (body.drama_id, body.author, body.title, body.content, body.summary, body.rating),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM reviews WHERE id = last_insert_rowid()").fetchone()
    conn.close()
    return {"review": dict(row)}


@app.put("/api/admin/reviews/{review_id}")
def update_review(review_id: int, body: ReviewUpdate, token: str = Depends(verify_admin)):
    conn = get_db()
    existing = conn.execute("SELECT id FROM reviews WHERE id = ?", (review_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Review not found")
    updates = body.model_dump(exclude_unset=True)
    if updates:
        cols = ", ".join(f"{k} = ?" for k in updates)
        conn.execute(f"UPDATE reviews SET {cols} WHERE id = ?", list(updates.values()) + [review_id])
    conn.commit()
    row = conn.execute("SELECT * FROM reviews WHERE id = ?", (review_id,)).fetchone()
    conn.close()
    return {"review": dict(row)}


@app.delete("/api/admin/reviews/{review_id}")
def delete_review(review_id: int, token: str = Depends(verify_admin)):
    conn = get_db()
    existing = conn.execute("SELECT id FROM reviews WHERE id = ?", (review_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Review not found")
    conn.execute("DELETE FROM comments WHERE review_id = ?", (review_id,))
    conn.execute("DELETE FROM likes WHERE review_id = ?", (review_id,))
    conn.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.post("/api/admin/blog")
def create_blog(body: BlogCreate, token: str = Depends(verify_admin)):
    conn = get_db()
    conn.execute(
        "INSERT INTO blog_posts (title, summary, content, tags) VALUES (?, ?, ?, ?)",
        (body.title, body.summary, body.content, body.tags),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM blog_posts WHERE id = last_insert_rowid()").fetchone()
    conn.close()
    return {"post": dict(row)}


@app.put("/api/admin/blog/{post_id}")
def update_blog(post_id: int, body: BlogUpdate, token: str = Depends(verify_admin)):
    conn = get_db()
    existing = conn.execute("SELECT id FROM blog_posts WHERE id = ?", (post_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")
    updates = body.model_dump(exclude_unset=True)
    if updates:
        cols = ", ".join(f"{k} = ?" for k in updates)
        conn.execute(f"UPDATE blog_posts SET {cols} WHERE id = ?", list(updates.values()) + [post_id])
    conn.commit()
    row = conn.execute("SELECT * FROM blog_posts WHERE id = ?", (post_id,)).fetchone()
    conn.close()
    return {"post": dict(row)}


@app.delete("/api/admin/blog/{post_id}")
def delete_blog(post_id: int, token: str = Depends(verify_admin)):
    conn = get_db()
    existing = conn.execute("SELECT id FROM blog_posts WHERE id = ?", (post_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Post not found")
    conn.execute("DELETE FROM blog_posts WHERE id = ?", (post_id,))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/{filename:path}")
async def serve_static(filename: str):
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html"))


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
