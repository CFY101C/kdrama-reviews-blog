import type { Metadata } from "next";
import Link from "next/link";
import { getDramaDetails } from "@/lib/tmdb";
import { getSession } from "@/lib/auth";
import ReviewForm from "@/components/review/ReviewForm";

interface NewReviewPageProps {
  params: Promise<{ tmdbId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: NewReviewPageProps): Promise<Metadata> {
  const { tmdbId } = await params;
  const id = parseInt(tmdbId, 10);
  if (isNaN(id)) return { title: "写影评 | 深夜放映室" };

  try {
    const show = await getDramaDetails(id);
    return { title: `写影评 · ${show.name} | 深夜放映室` };
  } catch {
    return { title: "写影评 | 深夜放映室" };
  }
}

export default async function NewReviewPage({ params }: NewReviewPageProps) {
  const { tmdbId } = await params;
  const id = parseInt(tmdbId, 10);

  if (isNaN(id)) {
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">无效的剧集 ID</h1>
        <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
          ← 返回浏览
        </Link>
      </main>
    );
  }

  const session = await getSession();
  if (!session) {
    return (
      <main className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">请先登录</h1>
        <p className="text-sm text-warm-muted mt-2">你需要登录后才能写影评</p>
        <Link
          href={`/login?redirect=/dramas/${id}/reviews/new`}
          className="inline-block mt-4 px-4 py-2 bg-coral text-white text-sm rounded-md hover:bg-coral-dark transition-colors"
        >
          去登录
        </Link>
      </main>
    );
  }

  let dramaName = "Unknown Drama";
  try {
    const show = await getDramaDetails(id);
    dramaName = show.name;
  } catch {
    // fallback
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/dramas/${id}`}
        className="text-sm text-coral hover:text-coral-dark transition-colors"
      >
        ← 返回 {dramaName}
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-warm-text">
        写影评 · {dramaName}
      </h1>
      <p className="mt-1 text-sm text-warm-muted">
        用文字记录你对这部韩剧的感受
      </p>

      <div className="mt-8">
        <ReviewForm tmdbId={id} />
      </div>
    </main>
  );
}
