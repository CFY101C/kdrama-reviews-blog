import { Suspense } from "react";
import Link from "next/link";
import {
  searchMulti,
  getTrendingDramas,
  getDramasByGenre,
  getDramaGenres,
  type TmdbTvShow,
  type TmdbMultiResult,
} from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";
import DramaCard from "@/components/drama/DramaCard";
import PersonCard from "@/components/drama/PersonCard";
import SearchBar from "@/components/drama/SearchBar";

interface DramasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function GenreTabs({ active }: { active: string | undefined }) {
  let genres: { id: number; name: string }[] = [];
  try {
    const result = await getDramaGenres();
    genres = result.genres;
  } catch {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href="/dramas"
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          !active
            ? "bg-coral text-white"
            : "bg-warm-border text-warm-muted hover:text-warm-text"
        }`}
      >
        全部
      </Link>
      {genres.map((g) => (
        <Link
          key={g.id}
          href={`/dramas?genre=${g.id}`}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            active === String(g.id)
              ? "bg-coral text-white"
              : "bg-warm-border text-warm-muted hover:text-warm-text"
          }`}
        >
          {g.name}
        </Link>
      ))}
    </div>
  );
}

async function DramaGrid({
  q,
  genre,
  page,
}: {
  q: string;
  genre: string;
  page: number;
}) {
  let shows: TmdbTvShow[] = [];
  let people: TmdbMultiResult[] = [];
  let totalPages = 0;
  let totalResults = 0;
  let error: string | null = null;

  try {
    if (q) {
      const result = await searchMulti(q, page);
      totalPages = result.total_pages;
      totalResults = result.total_results;

      const tvShows: TmdbTvShow[] = [];
      const persons: TmdbMultiResult[] = [];

      for (const item of result.results) {
        if (item.media_type === "tv") {
          tvShows.push(item as unknown as TmdbTvShow);
          if (item.first_air_date && item.name) {
            const year = new Date(item.first_air_date).getFullYear();
            await prisma.drama.upsert({
              where: { tmdbId: item.id },
              update: {
                title: item.name,
                year,
                posterUrl: item.poster_path,
                backdropUrl: null,
                synopsis: item.overview || "",
                rating: item.vote_average ?? 0,
              },
              create: {
                tmdbId: item.id,
                title: item.name,
                year,
                posterUrl: item.poster_path,
                backdropUrl: null,
                synopsis: item.overview || "",
                rating: item.vote_average ?? 0,
                episodes: 16,
              },
            });
          }
        } else if (
          item.media_type === "person" &&
          item.known_for_department === "Acting"
        ) {
          persons.push(item);
        }
      }

      shows = tvShows;
      people = persons;
    } else {
      let result;
      if (genre) {
        result = await getDramasByGenre(parseInt(genre, 10), page);
      } else {
        result = await getTrendingDramas(page);
      }

      shows = result.results;
      totalPages = result.total_pages;
      totalResults = result.total_results;

      for (const show of result.results) {
        if (show.first_air_date && show.name) {
          const year = new Date(show.first_air_date).getFullYear();
          await prisma.drama.upsert({
            where: { tmdbId: show.id },
            update: {
              title: show.name,
              year,
              posterUrl: show.poster_path,
              backdropUrl: show.backdrop_path,
              synopsis: show.overview || "",
              rating: show.vote_average,
            },
            create: {
              tmdbId: show.id,
              title: show.name,
              year,
              posterUrl: show.poster_path,
              backdropUrl: show.backdrop_path,
              synopsis: show.overview || "",
              rating: show.vote_average,
              episodes: 16,
            },
          });
        }
      }
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "无法加载韩剧数据，请检查网络后重试。";
  }

  if (error) {
    return (
      <div className="text-center py-16 text-warm-muted">
        <p>{error}</p>
      </div>
    );
  }

  if (!shows.length && !people.length) {
    return (
      <div className="text-center py-16 text-warm-muted">
        <p>没有找到相关结果，试试其他搜索词。</p>
      </div>
    );
  }

  return (
    <>
      {people.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-medium text-warm-text mb-3">
            演员 ({people.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {people.map((p) => (
              <PersonCard key={`person-${p.id}`} person={p} />
            ))}
          </div>
        </section>
      )}

      {shows.length > 0 && (
        <section>
          {people.length > 0 && (
            <h2 className="text-sm font-medium text-warm-text mb-3">
              剧集 ({totalResults})
            </h2>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {shows.map((show) => (
              <DramaCard key={show.id} show={show} />
            ))}
          </div>
        </section>
      )}

      <Pagination current={page} total={totalPages} q={q} genre={genre} />
    </>
  );
}

function Pagination({
  current,
  total,
  q,
  genre,
}: {
  current: number;
  total: number;
  q: string;
  genre: string;
}) {
  if (total <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/dramas${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {current > 1 && (
        <Link
          href={buildHref(current - 1)}
          className="px-3 py-1.5 text-sm text-warm-muted hover:text-warm-text transition-colors"
        >
          上一页
        </Link>
      )}
      <span className="text-sm text-warm-muted">
        {current} / {Math.min(total, 500)}
      </span>
      {current < total && (
        <Link
          href={buildHref(current + 1)}
          className="px-3 py-1.5 text-sm text-warm-muted hover:text-warm-text transition-colors"
        >
          下一页
        </Link>
      )}
    </div>
  );
}

function DramaGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden border border-warm-border animate-pulse"
        >
          <div className="aspect-[2/3] bg-warm-border" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-warm-border rounded w-3/4" />
            <div className="h-3 bg-warm-border rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function DramasPage({ searchParams }: DramasPageProps) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const genre = typeof sp.genre === "string" ? sp.genre : "";
  const page = parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1;

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-warm-text mb-4">浏览韩剧</h1>
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <GenreTabs active={genre || undefined} />
      </Suspense>

      <Suspense fallback={<DramaGridSkeleton />}>
        <DramaGrid q={q} genre={genre} page={page} />
      </Suspense>
    </main>
  );
}
