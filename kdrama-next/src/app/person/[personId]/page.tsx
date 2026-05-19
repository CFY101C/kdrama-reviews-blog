import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPersonDetails,
  getPersonTvCredits,
  profileUrl,
  posterUrl,
  extractYear,
  type TmdbTvShow,
} from "@/lib/tmdb";
import DramaCard from "@/components/drama/DramaCard";

interface PersonPageProps {
  params: Promise<{ personId: string }>;
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { personId } = await params;
  const id = parseInt(personId, 10);
  if (isNaN(id)) notFound();

  let person: Awaited<ReturnType<typeof getPersonDetails>>;
  let credits: Awaited<ReturnType<typeof getPersonTvCredits>>;

  try {
    [person, credits] = await Promise.all([
      getPersonDetails(id),
      getPersonTvCredits(id),
    ]);
  } catch {
    return (
      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 text-center text-warm-muted">
        <p>无法加载演员信息，请稍后重试。</p>
        <Link href="/dramas" className="text-coral hover:underline mt-4 inline-block">
          返回浏览
        </Link>
      </main>
    );
  }

  const shows = (credits.cast || [])
    .filter((item): item is TmdbTvShow & { character: string } =>
      !!(item.name && item.poster_path && item.first_air_date)
    )
    .sort((a, b) =>
      new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime()
    );

  const avatar = profileUrl(person.profile_path, "w342");

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/dramas"
        className="text-sm text-warm-muted hover:text-coral transition-colors mb-6 inline-block"
      >
        ← 返回浏览
      </Link>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={person.name}
              width={200}
              height={300}
              className="w-48 rounded-lg object-cover shadow-md"
            />
          ) : (
            <div className="w-48 h-64 rounded-lg bg-coral-soft flex items-center justify-center text-coral text-4xl font-bold">
              {person.name.slice(0, 2)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-warm-text mb-3">
            {person.name}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-warm-muted mb-4">
            {person.birthday && (
              <span>生日：{person.birthday}</span>
            )}
            {person.place_of_birth && (
              <span>出生地：{person.place_of_birth}</span>
            )}
            {person.known_for_department && (
              <span>职业：{person.known_for_department === "Acting" ? "演员" : person.known_for_department}</span>
            )}
          </div>

          {person.biography && (
            <div className="text-sm text-warm-text leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
              {person.biography}
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-warm-text mb-4">
          参演作品 ({shows.length})
        </h2>
        {shows.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {shows.map((show) => (
              <div key={`${show.id}-${show.character}`} className="group">
                <DramaCard show={show} />
                {show.character && (
                  <p className="mt-1 text-xs text-warm-muted truncate px-1">
                    饰 {show.character}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-warm-muted text-sm">暂无参演作品数据</p>
        )}
      </section>
    </main>
  );
}
