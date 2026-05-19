"use client";

import type { HookResult } from "@/lib/types";

interface HookCardProps {
  hook: HookResult;
  index: number;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  animDelay: number;
}

export default function HookCard({
  hook,
  index,
  onCopy,
  onToggleFavorite,
  animDelay,
}: HookCardProps) {
  const stars = Array.from({ length: 5 }, (_, i) => i < hook.clickScore);

  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-500/5 animate-fadeIn"
      style={{ animationDelay: `${animDelay}s` }}
    >
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
        {index + 1}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => onCopy(hook.content)}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
          title="复制"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button
          onClick={() => onToggleFavorite(hook.id)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            hook.isFavorite
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
          }`}
          title={hook.isFavorite ? "取消收藏" : "收藏"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill={hook.isFavorite ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Hook Content */}
      <p className="text-base md:text-lg font-semibold text-white leading-relaxed mt-2 mb-4">
        {hook.content}
      </p>

      {/* Style Tag */}
      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-500/15 to-purple-500/15 text-cyan-300 border border-cyan-400/20 mb-3">
        {hook.styleTag}
      </span>

      {/* Click Score */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs text-white/40">点击欲</span>
        <div className="flex gap-0.5">
          {stars.map((filled, i) => (
            <svg
              key={i}
              className={`h-3.5 w-3.5 ${filled ? "text-amber-400" : "text-white/15"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Reason */}
      <p className="text-xs text-white/40 leading-relaxed">{hook.reason}</p>
    </div>
  );
}
