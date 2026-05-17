import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from database import get_db, init_db


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
