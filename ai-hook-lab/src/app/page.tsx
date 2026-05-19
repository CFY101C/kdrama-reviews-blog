"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import InputPanel from "@/components/InputPanel";
import HookGrid from "@/components/HookGrid";
import HistoryDrawer from "@/components/HistoryDrawer";
import EmptyState from "@/components/EmptyState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Toast from "@/components/Toast";
import { useGenerate } from "@/hooks/useGenerate";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  getHistory,
  addHistory,
  clearHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/lib/storage";
import type {
  Platform,
  ContentType,
  HookResult,
  GenerationRecord,
} from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<Platform>("xiaohongshu");
  const [contentType, setContentType] = useState<ContentType>("video");
  const [hooks, setHooks] = useState<HookResult[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"history" | "favorites">("history");

  const [history, setHistory] = useLocalStorage<GenerationRecord[]>(
    STORAGE_KEYS.history,
    [],
  );
  const [favorites, setFavorites] = useLocalStorage<HookResult[]>(
    STORAGE_KEYS.favorites,
    [],
  );

  const [hasApiKey] = useState(true);

  const { generate, isLoading, error } = useGenerate();

  // load favorites from storage on mount
  useEffect(() => {
    const stored = getFavorites();
    setFavorites(stored);
  }, [setFavorites]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const handleCopy = useCallback(
    async (content: string) => {
      try {
        await navigator.clipboard.writeText(content);
        showToast("已复制到剪贴板");
      } catch {
        showToast("复制失败，请手动复制");
      }
    },
    [showToast],
  );

  const handleToggleFavorite = useCallback(
    (id: string) => {
      const hook =
        hooks.find((h) => h.id === id) ||
        favorites.find((f) => f.id === id);

      if (!hook) return;

      const isFav = hook.isFavorite;

      setHooks((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, isFavorite: !h.isFavorite } : h,
        ),
      );
      setFavorites((prev) =>
        isFav
          ? prev.filter((f) => f.id !== id)
          : [{ ...hook, isFavorite: true }, ...prev],
      );

      if (isFav) {
        removeFavorite(id);
        showToast("已取消收藏");
      } else {
        addFavorite({ ...hook, isFavorite: true });
        showToast("已加入收藏");
      }
    },
    [hooks, favorites, showToast, setFavorites],
  );

  const handleGenerate = useCallback(async () => {
    if (!topic.trim() || isLoading) return;
    setHasGenerated(true);

    try {
      const results = await generate({
        topic: topic.trim(),
        platform,
        contentType,
      });
      setHooks(results);

      const record: GenerationRecord = {
        id: Date.now().toString(),
        topic: topic.trim(),
        platform,
        contentType,
        hooks: results,
        createdAt: Date.now(),
      };
      addHistory(record);
      setHistory(getHistory());
    } catch {
      // error handled in useGenerate
      setHooks([]);
    }
  }, [topic, platform, contentType, generate, isLoading, setHistory]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
    showToast("历史已清空");
  }, [setHistory, showToast]);

  const handleLoadRecord = useCallback((record: GenerationRecord) => {
    setTopic(record.topic);
    setPlatform(record.platform);
    setContentType(record.contentType);
    setHooks(
      record.hooks.map((h) => ({
        ...h,
        isFavorite: getFavorites().some((f) => f.id === h.id),
      })),
    );
    setHasGenerated(true);
    setDrawerOpen(false);
  }, []);

  const showResults = hasGenerated && (isLoading || hooks.length > 0);
  const showEmpty = !hasGenerated && !isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a14] via-[#0f0f28] to-[#1a0a2e] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0a14]/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              AI Hook Lab
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDrawerTab("history");
                setHistory(getHistory());
                setFavorites(getFavorites());
                setDrawerOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
            >
              历史
            </button>
            <button
              onClick={() => {
                setDrawerTab("favorites");
                setFavorites(getFavorites());
                setDrawerOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
            >
              收藏
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Input Section */}
        <section>
          <InputPanel
            topic={topic}
            onTopicChange={setTopic}
            platform={platform}
            onPlatformChange={setPlatform}
            contentType={contentType}
            onContentTypeChange={setContentType}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            hasApiKey={hasApiKey}
          />
        </section>

        {/* Error display */}
        {error && (
          <div className="w-full max-w-2xl mx-auto rounded-xl border border-red-400/20 bg-red-500/5 backdrop-blur-sm px-5 py-4 text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Results Section */}
        {showResults && (
          <section>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <HookGrid
                hooks={hooks}
                onCopy={handleCopy}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </section>
        )}

        {/* Empty State */}
        {showEmpty && <EmptyState hasApiKey={hasApiKey} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 mt-12">
        <p className="text-center text-xs text-white/15">
          AI Hook Lab — 用 AI 激发你的内容创作灵感
        </p>
      </footer>

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />

      {/* Drawer */}
      <HistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tab={drawerTab}
        onTabChange={setDrawerTab}
        history={history}
        favorites={favorites}
        onCopy={handleCopy}
        onToggleFavorite={handleToggleFavorite}
        onClearHistory={handleClearHistory}
        onLoadRecord={handleLoadRecord}
      />
    </div>
  );
}
