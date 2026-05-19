"use client";

import type { HookResult } from "@/lib/types";
import HookCard from "./HookCard";

interface HookGridProps {
  hooks: HookResult[];
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function HookGrid({
  hooks,
  onCopy,
  onToggleFavorite,
}: HookGridProps) {
  if (hooks.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6 text-center">
        ✨ 生成了 {hooks.length} 个 Hook
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hooks.map((hook, i) => (
          <HookCard
            key={hook.id}
            hook={hook}
            index={i}
            onCopy={onCopy}
            onToggleFavorite={onToggleFavorite}
            animDelay={i * 0.06}
          />
        ))}
      </div>
    </div>
  );
}
