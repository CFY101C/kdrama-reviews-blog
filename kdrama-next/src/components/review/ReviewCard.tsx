import Link from "next/link";
import LikeButton from "./LikeButton";

interface ReviewAuthor {
  id: string;
  name: string;
  image?: string | null;
}

interface ReviewCardData {
  id: number;
  title: string;
  summary: string;
  rating: number;
  likesCount: number;
  createdAt: string | Date;
  author: ReviewAuthor;
  commentCount?: number;
  userLiked?: boolean;
  dramaId?: number;
  tmdbId?: number;
}

interface ReviewCardProps {
  review: ReviewCardData;
  showDramaLink?: boolean;
  showLikeButton?: boolean;
  onLoginRequired?: () => void;
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

function ratingStars(rating: number) {
  return "★".repeat(Math.round(rating / 2));
}

export default function ReviewCard({
  review,
  showDramaLink,
  showLikeButton,
  onLoginRequired,
}: ReviewCardProps) {
  const dramaHref = review.tmdbId
    ? `/dramas/${review.tmdbId}`
    : review.dramaId
      ? `/dramas/${review.dramaId}`
      : "";

  return (
    <article className="bg-warm-surface rounded-lg border border-warm-border/60 p-4 md:p-5 hover:border-warm-border transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-coral-soft flex items-center justify-center text-xs text-coral font-medium">
          {initials(review.author.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-warm-text">
              {review.author.name}
            </span>
            {showDramaLink && dramaHref && (
              <>
                <span className="text-warm-border">·</span>
                <Link
                  href={dramaHref}
                  className="text-xs text-coral hover:text-coral-dark transition-colors"
                >
                  查看剧集
                </Link>
              </>
            )}
            <span className="text-xs text-warm-muted ml-auto">
              {formatDate(review.createdAt)}
            </span>
          </div>

          <Link
            href={`/dramas/${review.tmdbId || review.dramaId}/reviews/${review.id}`}
          >
            <h3 className="mt-1.5 text-base font-medium text-warm-text hover:text-coral transition-colors line-clamp-1">
              {review.title}
            </h3>
          </Link>

          <div className="mt-1 text-sm text-gold">
            {ratingStars(review.rating)}
          </div>

          <p className="mt-2 text-sm text-warm-muted line-clamp-2 leading-relaxed">
            {review.summary}
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs text-warm-muted">
            {showLikeButton ? (
              <LikeButton
                reviewId={review.id}
                initialLiked={review.userLiked ?? false}
                initialCount={review.likesCount}
                onLoginRequired={onLoginRequired}
              />
            ) : (
              <span className="flex items-center gap-1">
                ♡ {review.likesCount || 0}
              </span>
            )}
            {review.commentCount !== undefined && (
              <span>💬 {review.commentCount}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
