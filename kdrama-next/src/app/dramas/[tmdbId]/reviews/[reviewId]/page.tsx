import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/review/LikeButton";
import CommentSection from "@/components/comment/CommentSection";

interface ReviewDetailPageProps {
  params: Promise<{ tmdbId: string; reviewId: string }>;
}

interface ReviewData {
  id: number;
  title: string;
  content: string;
  summary: string;
  rating: number;
  likesCount: number;
  createdAt: Date | string;
  author: { id: string; name: string; image?: string | null };
  drama: { id: number; tmdbId: number; title: string };
  _count: { comments: number; likes: number };
}

export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { reviewId } = await params;
  const id = parseInt(reviewId, 10);
  if (isNaN(id)) return { title: "影评 | 深夜放映室" };
  try {
    const review = await prisma.review.findUnique({
      where: { id },
      select: { title: true, summary: true },
    });
    if (!review) return { title: "影评不存在 | 深夜放映室" };
    return {
      title: `${review.title} | 深夜放映室`,
      description: review.summary,
    };
  } catch {
    return { title: "影评 | 深夜放映室" };
  }
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { tmdbId, reviewId } = await params;
  const id = parseInt(reviewId, 10);

  if (isNaN(id)) {
    return (
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">无效的影评 ID</h1>
        <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
          ← 返回浏览
        </Link>
      </main>
    );
  }

  let review: ReviewData | null = null;
  let fetchError: string | null = null;
  let isOwner = false;

  try {
    const dbReview = await prisma.review.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        drama: { select: { id: true, tmdbId: true, title: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!dbReview) {
      fetchError = "影评不存在";
    } else {
      review = dbReview;
      const session = await getSession();
      if (session && review.author.id === session.id) {
        isOwner = true;
      }
    }
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "获取影评失败";
  }

  if (fetchError || !review) {
    return (
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">{fetchError || "影评不存在"}</h1>
        <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
          ← 返回浏览
        </Link>
      </main>
    );
  }

  function ratingStars(rating: number) {
    return "★".repeat(Math.round(rating / 2));
  }

  function formatDate(date: string | Date) {
    const d = new Date(date);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function initials(name: string) {
    return name.slice(0, 2);
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 text-sm text-warm-muted mb-6">
        <Link
          href={`/dramas/${tmdbId}`}
          className="text-coral hover:text-coral-dark transition-colors"
        >
          ← {review.drama.title}
        </Link>
        <span className="text-warm-border">/</span>
        <span>影评</span>
      </div>

      <article>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-coral-soft flex items-center justify-center text-sm text-coral font-medium">
            {initials(review.author.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-warm-text">
                {review.author.name}
              </span>
              <span className="text-xs text-warm-muted">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
          {isOwner && (
            <Link
              href={`/dramas/${tmdbId}/reviews/${review.id}/edit`}
              className="text-xs text-warm-muted hover:text-coral transition-colors"
            >
              编辑
            </Link>
          )}
        </div>

        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-warm-text">
          {review.title}
        </h1>

        <div className="mt-2 text-gold text-lg">
          {ratingStars(review.rating)}{" "}
          <span className="text-sm text-warm-muted">{review.rating}/10</span>
        </div>

        <div className="mt-6 text-warm-text leading-relaxed whitespace-pre-wrap text-[15px]">
          {review.content}
        </div>

        <div className="mt-6 flex items-center gap-4 pt-4 border-t border-warm-border">
          <LikeButton
            reviewId={review.id}
            initialLiked={false}
            initialCount={review.likesCount}
          />
          <span className="text-sm text-warm-muted">
            💬 {review._count.comments}
          </span>
        </div>
      </article>

      <CommentSection reviewId={review.id} />
    </main>
  );
}
