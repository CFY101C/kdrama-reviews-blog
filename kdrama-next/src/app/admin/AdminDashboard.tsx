"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  users: number;
  reviews: number;
  dramas: number;
  comments: number;
}

interface ReviewItem {
  id: number;
  title: string;
  rating: number;
  createdAt: string;
  author: { name: string; email: string };
  drama: { title: string; tmdbId: number };
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Props {
  stats: Stats;
  recentReviews: ReviewItem[];
  recentUsers: UserItem[];
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-warm-border p-4">
      <div className="text-2xl font-bold text-warm-text">{value}</div>
      <div className="text-xs text-warm-muted mt-1">{label}</div>
    </div>
  );
}

export default function AdminDashboard({
  stats,
  recentReviews,
  recentUsers,
}: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState(recentReviews);
  const [activeTab, setActiveTab] = useState<"reviews" | "users">("reviews");
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleDeleteReview(reviewId: number) {
    if (!confirm("确定要删除这条影评吗？")) return;

    setDeleting(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-text">管理后台</h1>
          <p className="text-sm text-warm-muted mt-1">网站数据概览</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg border border-warm-border text-sm text-warm-muted hover:text-warm-text hover:border-warm-text transition-colors"
        >
          退出管理
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="注册用户" value={stats.users} />
        <StatCard label="影评总数" value={stats.reviews} />
        <StatCard label="韩剧条目" value={stats.dramas} />
        <StatCard label="评论总数" value={stats.comments} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-warm-border/30 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === "reviews"
              ? "bg-white text-warm-text shadow-sm"
              : "text-warm-muted hover:text-warm-text"
          }`}
        >
          最新影评
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-white text-warm-text shadow-sm"
              : "text-warm-muted hover:text-warm-text"
          }`}
        >
          最新用户
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 && (
            <p className="text-sm text-warm-muted py-8 text-center">
              暂无影评
            </p>
          )}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border border-warm-border p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-warm-text truncate">
                    {review.title}
                  </span>
                  <span className="text-xs text-gold shrink-0">
                    {"★".repeat(Math.round(review.rating))}
                  </span>
                </div>
                <div className="text-xs text-warm-muted">
                  {review.author.name} · {review.drama.title} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <button
                onClick={() => handleDeleteReview(review.id)}
                disabled={deleting === review.id}
                className="px-3 py-1.5 rounded-lg text-xs text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 shrink-0"
              >
                {deleting === review.id ? "删除中..." : "删除"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-3">
          {recentUsers.length === 0 && (
            <p className="text-sm text-warm-muted py-8 text-center">
              暂无用户
            </p>
          )}
          {recentUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-warm-border p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-warm-text">
                  {user.name}
                </div>
                <div className="text-xs text-warm-muted">{user.email}</div>
              </div>
              <div className="text-xs text-warm-muted shrink-0">
                {new Date(user.createdAt).toLocaleDateString("zh-CN")}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
