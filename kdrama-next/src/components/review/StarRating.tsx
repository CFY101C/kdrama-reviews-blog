"use client";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, readonly }: StarRatingProps) {
  const stars = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((n) => {
        const filled = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(n)}
            className={`text-lg transition-all ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } ${filled ? "text-gold" : "text-warm-border"}`}
            aria-label={`${n} 星`}
          >
            ★
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm text-warm-muted">
          {value}/10
        </span>
      )}
    </div>
  );
}
