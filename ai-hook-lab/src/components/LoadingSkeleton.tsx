"use client";

export default function LoadingSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="h-8 w-48 bg-white/5 rounded-lg mx-auto mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="h-5 bg-white/5 rounded w-3/4" />
            <div className="h-5 bg-white/5 rounded w-full" />
            <div className="h-5 bg-white/5 rounded w-1/2" />
            <div className="h-4 bg-white/5 rounded-full w-20" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="h-3 w-3 bg-white/5 rounded" />
              ))}
            </div>
            <div className="h-3 bg-white/5 rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
