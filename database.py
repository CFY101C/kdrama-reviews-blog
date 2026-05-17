import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kdrama.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS dramas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            title_ko TEXT NOT NULL DEFAULT '',
            year INTEGER NOT NULL,
            episodes INTEGER NOT NULL DEFAULT 16,
            cast TEXT NOT NULL DEFAULT '',
            director TEXT NOT NULL DEFAULT '',
            writer TEXT NOT NULL DEFAULT '',
            genre TEXT NOT NULL DEFAULT '',
            poster_url TEXT NOT NULL DEFAULT '',
            rating REAL NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            drama_id INTEGER NOT NULL,
            author TEXT NOT NULL DEFAULT '匿名用户',
            title TEXT NOT NULL,
            content TEXT NOT NULL DEFAULT '',
            summary TEXT NOT NULL DEFAULT '',
            rating REAL NOT NULL DEFAULT 0,
            likes_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (drama_id) REFERENCES dramas(id)
        );

        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_id INTEGER NOT NULL,
            author TEXT NOT NULL DEFAULT '匿名用户',
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (review_id) REFERENCES reviews(id)
        );

        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            review_id INTEGER NOT NULL,
            user_token TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (review_id) REFERENCES reviews(id),
            UNIQUE(review_id, user_token)
        );

        CREATE INDEX IF NOT EXISTS idx_reviews_drama_id ON reviews(drama_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
        CREATE INDEX IF NOT EXISTS idx_comments_review_id ON comments(review_id);
        CREATE INDEX IF NOT EXISTS idx_likes_review_id ON likes(review_id);
    """)
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
