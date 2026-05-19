"use client";

import type { GenerationRecord, HookResult } from "@/lib/types";
import HookCard from "./HookCard";

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  tab: "history" | "favorites";
  onTabChange: (tab: "history" | "favorites") => void;
  history: GenerationRecord[];
  favorites: HookResult[];
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  onLoadRecord: (record: GenerationRecord) => void;
}

export default function HistoryDrawer({
  open,
  onClose,
  tab,
  onTabChange,
  history,
  favorites,
  onCopy,
  onToggleFavorite,
  onClearHistory,
  onLoadRecord,
}: HistoryDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0a0a12] border-l border-white/10 z-50 flex flex-col shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => onTabChange("history")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "history"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              历史记录
            </button>
            <button
              onClick={() => onTabChange("favorites")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === "favorites"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              收藏夹
            </button>
          </div>
          <div className="flex items-center gap-3">
            {tab === "history" && history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
              >
                清空
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* History Tab */}
          {tab === "history" && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white/20 text-lg mb-2">暂无历史记录</p>
                  <p className="text-white/15 text-sm">
                    生成 Hook 后会自动保存在这里
                  </p>
                </div>
              ) : (
                history.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => onLoadRecord(record)}
                    className="rounded-xl border border-white/8 bg-white/[0.02] p-4 hover:border-white/20 hover:bg-white/[0.05] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
                        {record.platform}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/20">
                        {record.contentType}
                      </span>
                    </div>
                    <p className="text-white/80 text-sm font-medium mb-2">
                      {record.topic}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/25">
                        {record.hooks.length} 个 Hook
                      </span>
                      <span className="text-xs text-white/20">
                        {new Date(record.createdAt).toLocaleDateString(
                          "zh-CN",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {tab === "favorites" && (
            <div className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-white/20 text-lg mb-2">暂无收藏</p>
                  <p className="text-white/15 text-sm">
                    点击 Hook 卡片上的爱心来收藏
                  </p>
                </div>
              ) : (
                favorites.map((hook, i) => (
                  <HookCard
                    key={hook.id}
                    hook={hook}
                    index={i}
                    onCopy={onCopy}
                    onToggleFavorite={onToggleFavorite}
                    animDelay={0}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
