import Image from "next/image";
import Link from "next/link";
import { posterUrl, extractYear, type TmdbTvShow } from "@/lib/tmdb";

interface DramaCardProps {
  show: TmdbTvShow;
  priority?: boolean;
}

export default function DramaCard({ show, priority }: DramaCardProps) {
  const href = `/dramas/${show.id}`;
  const src = posterUrl(show.poster_path, "w342");
  const year = extractYear(show);
  const rating = show.vote_average > 0 ? show.vote_average.toFixed(1) : null;

  return (
    <Link
      href={href}
      className="group block rounded-lg overflow-hidden bg-warm-surface border border-warm-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-warm-border">
        {src ? (
          <Image
            src={src}
            alt={show.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-warm-muted text-sm">
            暂无海报
          </div>
        )}
        {rating && (
          <span className="absolute top-2 right-2 bg-coral text-white text-xs px-1.5 py-0.5 rounded">
            {rating}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-warm-text line-clamp-1 group-hover:text-coral transition-colors">
          {show.name}
        </h3>
        <p className="text-xs text-warm-muted mt-1">
          {year || "未知年份"}
          {show.origin_country?.length ? ` · ${show.origin_country.join("/")}` : ""}
        </p>
      </div>
    </Link>
  );
}
