import Image from "next/image";
import Link from "next/link";
import { type TmdbMultiResult, posterUrl, profileUrl, extractYear } from "@/lib/tmdb";

export default function PersonCard({ person }: { person: TmdbMultiResult }) {
  const avatar = profileUrl(person.profile_path ?? null);
  const knownShows = (person.known_for || [])
    .filter((item) => item.media_type === "tv" && item.poster_path)
    .slice(0, 4);

  return (
    <div className="bg-warm-surface rounded-lg border border-warm-border/60 p-4 hover:border-warm-border transition-colors">
      <Link href={`/person/${person.id}`} className="flex items-center gap-3 mb-3 group/person">
        {avatar ? (
          <Image
            src={avatar}
            alt={person.name || ""}
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0 group-hover/person:ring-2 group-hover/person:ring-coral/40 transition-all"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-coral-soft flex items-center justify-center text-coral text-lg font-medium flex-shrink-0 group-hover/person:ring-2 group-hover/person:ring-coral/40 transition-all">
            {(person.name || "").slice(0, 2)}
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-warm-text group-hover/person:text-coral transition-colors">
            {person.name}
          </h3>
          <span className="text-xs text-warm-muted">演员</span>
        </div>
      </Link>

      {knownShows.length > 0 && (
        <div>
          <p className="text-xs text-warm-muted mb-2">代表作</p>
          <div className="grid grid-cols-4 gap-2">
            {knownShows.map((show) => {
              const img = posterUrl(show.poster_path, "w154");

              return (
                <Link key={show.id} href={`/dramas/${show.id}`} className="group block">
                  {img ? (
                    <Image
                      src={img}
                      alt={show.name || ""}
                      width={154}
                      height={231}
                      className="w-full aspect-[2/3] object-cover rounded group-hover:ring-2 group-hover:ring-coral/40 transition-all"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-warm-bg rounded flex items-center justify-center text-[8px] text-warm-muted text-center leading-tight px-1 group-hover:ring-2 group-hover:ring-coral/40 transition-all">
                      {show.name}
                    </div>
                  )}
                  <p className="mt-1 text-[10px] text-warm-muted truncate group-hover:text-coral transition-colors">
                    {show.name}
                  </p>
                  {show.first_air_date && (
                    <p className="text-[9px] text-warm-muted/60">
                      {extractYear(show as import("@/lib/tmdb").TmdbTvShow)}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
