"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");
  const isComposing = useRef(false);

  useEffect(() => {
    if (!isComposing.current) {
      setValue(searchParams.get("q") || "");
    }
  }, [searchParams]);

  const pushQuery = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
        params.delete("page");
      } else {
        params.delete("q");
      }
      router.push(`/dramas?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    if (isComposing.current) return;
    const timer = setTimeout(() => {
      if (value !== (searchParams.get("q") || "")) {
        pushQuery(value);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value, searchParams, pushQuery]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposing.current = false;
          const v = e.data || e.currentTarget.value;
          setValue(v);
          if (v !== (searchParams.get("q") || "")) {
            pushQuery(v);
          }
        }}
        placeholder="搜索韩剧或演员..."
        className="w-full px-4 py-3 pl-10 rounded-lg border border-warm-border bg-warm-surface text-warm-text placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all text-sm"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
