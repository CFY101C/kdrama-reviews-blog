import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getDramaDetails,
  getDramaCredits,
  posterUrl,
  backdropUrl,
  mapGenres,
} from "@/lib/tmdb";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewCard from "@/components/review/ReviewCard";

interface ReviewItem {
  id: number;
  title: string;
  summary: string;
  rating: number;
  likesCount: number;
  createdAt: string;
  author: { id: string; name: string; image?: string | null };
  commentCount: number;
}

interface DramaDetailProps {
  params: Promise<{ tmdbId: string }>;
}

export async function generateMetadata({
  params,
}: DramaDetailProps): Promise<Metadata> {
  const { tmdbId } = await params;
  const id = parseInt(tmdbId, 10);

  if (isNaN(id)) {
    return { title: "剧集未找到 | 深夜放映室" };
  }

  try {
    const show = await getDramaDetails(id);
    return {
      title: `${show.name} | 深夜放映室`,
      description: show.overview?.slice(0, 160) || "韩剧详情",
    };
  } catch {
    return { title: "剧集未找到 | 深夜放映室" };
  }
}

export default async function DramaDetailPage({ params }: DramaDetailProps) {
  const { tmdbId } = await params;
  const id = parseInt(tmdbId, 10);

  if (isNaN(id)) {
    return (
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">无效的剧集 ID</h1>
        <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
          ← 返回浏览
        </Link>
      </main>
    );
  }

  try {
    const [show, credits, session] = await Promise.all([
      getDramaDetails(id),
      getDramaCredits(id),
      getSession(),
    ]);

    const poster = posterUrl(show.poster_path);
    const backdrop = backdropUrl(show.backdrop_path);
    const genres = mapGenres(show.genres || []);
    const year = show.first_air_date
      ? new Date(show.first_air_date).getFullYear()
      : null;
    const director = credits.crew
      .filter((c) => c.job === "Director")
      .map((c) => c.name)
      .join("、");
    const writer = credits.crew
      .filter((c) => c.department === "Writing")
      .map((c) => c.name)
      .slice(0, 3)
      .join("、");

    return (
      <main className="flex-1">
        {backdrop ? (
          <div className="relative h-48 md:h-64 overflow-hidden">
            <Image
              src={backdrop}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-bg via-warm-bg/60 to-transparent" />
          </div>
        ) : (
          <div className="h-16" />
        )}

        <div className="max-w-4xl mx-auto px-4 -mt-20 relative">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="flex-shrink-0 mx-auto md:mx-0 w-40 md:w-52">
              {poster ? (
                <Image
                  src={poster}
                  alt={show.name}
                  width={208}
                  height={312}
                  className="rounded-lg shadow-lg w-full"
                  priority
                />
              ) : (
                <div className="aspect-[2/3] bg-warm-border rounded-lg flex items-center justify-center text-warm-muted text-sm">
                  暂无海报
                </div>
              )}
            </div>

            <div className="flex-1 pt-4 md:pt-16">
              <h1 className="text-2xl md:text-3xl font-bold text-warm-text">
                {show.name}
              </h1>
              {show.original_name &&
                show.original_name !== show.name && (
                  <p className="text-sm text-warm-muted mt-1">
                    {show.original_name}
                  </p>
                )}

              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-warm-muted">
                {year && <span>{year}</span>}
                {show.vote_average > 0 && (
                  <span className="text-coral font-medium">
                    ★ {show.vote_average.toFixed(1)}
                  </span>
                )}
                {show.number_of_episodes && (
                  <span>{show.number_of_episodes} 集</span>
                )}
                {show.number_of_seasons &&
                  show.number_of_seasons > 1 && (
                    <span>{show.number_of_seasons} 季</span>
                  )}
              </div>

              {genres && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {genres.split("、").map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 text-xs rounded bg-coral-soft text-coral"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {show.overview && (
                <p className="mt-5 text-sm text-warm-text leading-relaxed">
                  {show.overview}
                </p>
              )}

              <div className="mt-5 space-y-1.5 text-sm text-warm-muted">
                {director && (
                  <p>
                    <span className="font-medium text-warm-text">导演：</span>
                    {director}
                  </p>
                )}
                {writer && (
                  <p>
                    <span className="font-medium text-warm-text">编剧：</span>
                    {writer}
                  </p>
                )}
                {credits.cast.length > 0 && (
                  <p>
                    <span className="font-medium text-warm-text">主演：</span>
                    {credits.cast
                      .slice(0, 8)
                      .map((c) => c.name)
                      .join("、")}
                  </p>
                )}
                {show.created_by &&
                  show.created_by.length > 0 && (
                    <p>
                      <span className="font-medium text-warm-text">
                        创作者：
                      </span>
                      {show.created_by.map((c) => c.name).join("、")}
                    </p>
                  )}
                {show.networks && show.networks.length > 0 && (
                  <p>
                    <span className="font-medium text-warm-text">
                      播出平台：
                    </span>
                    {show.networks.map((n) => n.name).join("、")}
                  </p>
                )}
              </div>
            </div>
          </div>

          <ReviewsSection tmdbId={id} session={session} />
          <div className="mt-10 pb-16">
            <Link
              href="/dramas"
              className="text-sm text-coral hover:text-coral-dark transition-colors"
            >
              ← 返回浏览
            </Link>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return (
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl text-warm-muted">无法加载剧集信息</h1>
        <p className="text-sm text-warm-muted mt-2">{message}</p>
        <Link
          href="/dramas"
          className="text-coral hover:underline mt-4 inline-block"
        >
          ← 返回浏览
        </Link>
      </main>
    );
  }
}

async function ReviewsSection({
  tmdbId,
  session,
}: {
  tmdbId: number;
  session: { id: string } | null;
}) {
  try {
    const drama = await prisma.drama.findUnique({ where: { tmdbId } });
    if (!drama) {
      return <p className="text-sm text-warm-muted">暂无影评，来写第一篇吧</p>;
    }

    const dbReviews = await prisma.review.findMany({
      where: { dramaId: drama.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const reviews: ReviewItem[] = dbReviews.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      rating: r.rating,
      likesCount: r.likesCount,
      createdAt: r.createdAt.toISOString(),
      author: r.author,
      commentCount: r._count.comments,
    }));

    return (
      <section className="mt-10 border-t border-warm-border pt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-warm-text">
            影评 ({reviews.length})
          </h2>
          {session ? (
            <Link
              href={`/dramas/${tmdbId}/reviews/new`}
              className="px-4 py-1.5 bg-coral text-white text-xs font-medium rounded-md hover:bg-coral-dark transition-colors"
            >
              写影评
            </Link>
          ) : (
            <Link
              href={`/login?redirect=/dramas/${tmdbId}`}
              className="text-xs text-warm-muted hover:text-coral transition-colors"
            >
              登录后写影评
            </Link>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-warm-muted">暂无影评，来写第一篇吧</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={{ ...r, tmdbId }} />
            ))}
          </div>
        )}
      </section>
    );
  } catch {
    return <p className="text-sm text-warm-muted">加载影评失败</p>;
  }
}
