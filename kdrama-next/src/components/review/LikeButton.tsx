"use client";

import { useState, useCallback } from "react";

interface LikeButtonProps {
  reviewId: number;
  initialLiked: boolean;
  initialCount: number;
  onLoginRequired?: () => void;
}

export default function LikeButton({
  reviewId,
  initialLiked,
  initialCount,
  onLoginRequired,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  const handleToggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    const prevLiked = liked;
    const prevCount = count;

    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, {
        method: "POST",
      });
      const data = await res.json();

      if (!data.success) {
        if (res.status === 401 && onLoginRequired) {
          onLoginRequired();
          return;
        }
        throw new Error(data.error);
      }

      setLiked(data.data.liked);
      setCount(data.data.likesCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setBusy(false);
    }
  }, [reviewId, liked, count, busy, onLoginRequired]);

  return (
    <button
      onClick={handleToggle}
      disabled={busy}
      className={`flex items-center gap-1 text-sm transition-colors ${
        liked
          ? "text-coral"
          : "text-warm-muted hover:text-coral"
      } disabled:opacity-60`}
      aria-label={liked ? "取消点赞" : "点赞"}
    >
      <span className={liked ? "scale-110" : ""}>
        {liked ? "❤" : "♡"}
      </span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
