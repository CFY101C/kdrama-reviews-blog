"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";

interface ReviewFormProps {
  tmdbId: number;
  initialData?: {
    id: number;
    title: string;
    content: string;
    rating: number;
  };
}

export default function ReviewForm({ tmdbId, initialData }: ReviewFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [rating, setRating] = useState(initialData?.rating ?? 0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("请填写标题");
      return;
    }
    if (!content.trim()) {
      setError("请填写内容");
      return;
    }
    if (rating < 1) {
      setError("请给出评分");
      return;
    }

    setSubmitting(true);

    try {
      const url = isEdit
        ? `/api/reviews/${initialData.id}`
        : `/api/dramas/${tmdbId}/reviews`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), rating }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      if (isEdit) {
        router.push(`/dramas/${tmdbId}/reviews/${initialData.id}`);
      } else {
        router.push(`/dramas/${tmdbId}`);
      }
      router.refresh();
    } catch {
      setError("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-warm-text mb-1.5">
          评分
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label
          htmlFor="review-title"
          className="block text-sm font-medium text-warm-text mb-1.5"
        >
          标题
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给你的影评取个标题..."
          maxLength={100}
          className="w-full px-3 py-2 bg-warm-bg border border-warm-border rounded-md text-sm text-warm-text placeholder-warm-muted focus:outline-none focus:border-coral transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="review-content"
          className="block text-sm font-medium text-warm-text mb-1.5"
        >
          内容
        </label>
        <div
          className="w-full min-h-[200px] px-3 py-2 bg-warm-bg border border-warm-border rounded-md text-sm text-warm-text focus-within:border-coral transition-colors"
        >
          <div
            contentEditable
            id="review-content"
            role="textbox"
            aria-multiline="true"
            aria-label="影评内容"
            suppressContentEditableWarning
            onInput={(e) => setContent(e.currentTarget.innerText ?? "")}
            className="outline-none min-h-[180px] whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-coral bg-coral-soft/50 px-3 py-1.5 rounded">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-coral text-white text-sm font-medium rounded-md hover:bg-coral-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "提交中..." : isEdit ? "保存修改" : "发表影评"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-3 py-2 text-sm text-warm-muted hover:text-warm-text transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
