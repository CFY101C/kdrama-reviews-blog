"use client";

import { useState, useEffect, useCallback } from "react";

interface Author {
  id: string;
  name: string;
  image?: string | null;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
}

export default function CommentSection({ reviewId }: { reviewId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Author | null | undefined>(undefined);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/reviews/${reviewId}/comments`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setComments(d.data.comments);
      })
      .finally(() => setLoading(false));

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUser(d.data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, [reviewId]);

  const handlePost = useCallback(async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError("");

    try {
      const res = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setComments((prev) => [...prev, data.data.comment]);
      setContent("");
    } catch {
      setError("发表评论失败");
    } finally {
      setPosting(false);
    }
  }, [reviewId, content]);

  const handleDelete = useCallback(async (commentId: number) => {
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } finally {
      setDeletingId(null);
    }
  }, []);

  function initials(name: string) {
    return name.slice(0, 2);
  }

  function formatDate(date: string) {
    const d = new Date(date);
    return d.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="space-y-3 mt-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-warm-border" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-warm-border rounded w-20" />
              <div className="h-3 bg-warm-border rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-warm-text mb-4">
        评论 ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-sm text-warm-muted mb-4">暂无评论</p>
      ) : (
        <div className="space-y-3 mb-6">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-coral-soft flex items-center justify-center text-[10px] text-coral font-medium">
                {initials(c.author.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-warm-text">
                    {c.author.name}
                  </span>
                  <span className="text-[10px] text-warm-muted">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-warm-text leading-relaxed break-words">
                  {c.content}
                </p>
                {user && c.author.id === user.id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="mt-0.5 text-[10px] text-warm-muted hover:text-coral transition-colors disabled:opacity-50"
                  >
                    {deletingId === c.id ? "删除中..." : "删除"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {user === undefined ? (
        <div className="h-10 bg-warm-border/30 rounded animate-pulse" />
      ) : user ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            rows={2}
            className="w-full px-3 py-2 bg-warm-bg border border-warm-border rounded-md text-sm text-warm-text placeholder-warm-muted focus:outline-none focus:border-coral transition-colors resize-none"
          />
          {error && (
            <p className="text-xs text-coral">{error}</p>
          )}
          <button
            onClick={handlePost}
            disabled={posting || !content.trim()}
            className="px-4 py-1.5 bg-coral text-white text-xs font-medium rounded-md hover:bg-coral-dark transition-colors disabled:opacity-50"
          >
            {posting ? "发送中..." : "发表评论"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-warm-muted">
          请先
          <a href="/login" className="text-coral hover:underline mx-1">
            登录
          </a>
          后发表评论
        </p>
      )}
    </div>
  );
}
