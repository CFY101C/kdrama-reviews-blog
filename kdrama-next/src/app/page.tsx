import Link from "next/link";
import { getTrendingDramas, type TmdbTvShow } from "@/lib/tmdb";
import DramaCard from "@/components/drama/DramaCard";

export default async function HomePage() {
  let dramas: TmdbTvShow[] = [];
  let error: string | null = null;

  try {
    const result = await getTrendingDramas();
    dramas = result.results.slice(0, 20);
  } catch {
    error = "无法加载韩剧数据，请稍后再试。";
  }

  return (
    <main className="flex-1">
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-coral-soft/20 to-transparent pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-warm-text tracking-wide">
            深夜放映室
          </h1>
          <p className="mt-4 text-lg text-warm-muted leading-relaxed">
            一部好剧，一杯热茶，一个安静的夜晚。
            <br />
            这里记录着每一部触动心灵的韩剧和它们背后的故事。
          </p>
          <Link
            href="/dramas"
            className="inline-block mt-8 px-6 py-3 bg-coral text-white rounded-full text-sm font-medium hover:bg-coral-dark transition-colors"
          >
            浏览韩剧
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-warm-text">热门韩剧</h2>
          <Link
            href="/dramas"
            className="text-sm text-coral hover:text-coral-dark transition-colors"
          >
            查看全部 →
          </Link>
        </div>

        {error ? (
          <div className="text-center py-16 text-warm-muted">{error}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {dramas.map((show, i) => (
              <DramaCard key={show.id} show={show} priority={i < 4} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
