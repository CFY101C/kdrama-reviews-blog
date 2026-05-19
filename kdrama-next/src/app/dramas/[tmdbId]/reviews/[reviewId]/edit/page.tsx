import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import ReviewForm from "@/components/review/ReviewForm";

const API = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface EditReviewPageProps {
  params: Promise<{ tmdbId: string; reviewId: string }>;
}

interface ReviewData {
  id: number;
  title: string;
  content: string;
  rating: number;
  author: { id: string };
  drama: { title: string };
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "编辑影评 | 深夜放映室" };
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { tmdbId, reviewId } = await params;
  const id = parseInt(reviewId, 10);
  const dramaId = parseInt(tmdbId, 10);

  const session = await getSession();
  if (!session) {
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">请先登录</h1>
        <Link
          href={`/login?redirect=/dramas/${dramaId}/reviews/${id}/edit`}
          className="text-coral hover:underline mt-4 inline-block"
        >
          去登录
        </Link>
      </main>
    );
  }

  if (isNaN(id)) {
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">无效的影评 ID</h1>
        <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
          ← 返回浏览
        </Link>
      </main>
    );
  }

  try {
    const res = await fetch(`${API}/api/reviews/${reviewId}`);
    const data = await res.json();

    if (!data.success) {
      return (
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl text-warm-muted">{data.error}</h1>
          <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
            ← 返回浏览
          </Link>
        </main>
      );
    }

    const review: ReviewData = data.data.review;
    if (review.author.id !== session.id) {
      return (
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-xl text-warm-muted">只能编辑自己的影评</h1>
          <Link
            href={`/dramas/${dramaId}`}
            className="text-coral hover:underline mt-4 inline-block"
          >
            ← 返回
          </Link>
        </main>
      );
    }

    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/dramas/${dramaId}/reviews/${id}`}
          className="text-sm text-coral hover:text-coral-dark transition-colors"
        >
          ← 返回影评
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-warm-text">
          编辑影评 · {review.drama.title}
        </h1>

        <div className="mt-8">
          <ReviewForm
            tmdbId={dramaId}
            initialData={{
              id: review.id,
              title: review.title,
              content: review.content,
              rating: review.rating,
            }}
          />
        </div>
      </main>
    );
  } catch {
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">获取影评失败</h1>
        <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
          ← 返回浏览
        </Link>
      </main>
    );
  }
}
