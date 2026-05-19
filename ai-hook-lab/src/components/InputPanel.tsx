"use client";

import { PLATFORMS, CONTENT_TYPES, MAX_TOPIC_LENGTH } from "@/lib/constants";
import type { Platform, ContentType } from "@/lib/types";

interface InputPanelProps {
  topic: string;
  onTopicChange: (v: string) => void;
  platform: Platform;
  onPlatformChange: (v: Platform) => void;
  contentType: ContentType;
  onContentTypeChange: (v: ContentType) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasApiKey: boolean;
}

export default function InputPanel({
  topic,
  onTopicChange,
  platform,
  onPlatformChange,
  contentType,
  onContentTypeChange,
  onGenerate,
  isLoading,
  hasApiKey,
}: InputPanelProps) {
  const canGenerate =
    topic.trim().length > 0 && !isLoading && hasApiKey;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5">
      {/* Topic Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          输入主题
        </label>
        <textarea
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="例如：早起自律打卡、iPhone摄影技巧、AI 副业赚钱..."
          maxLength={MAX_TOPIC_LENGTH}
          rows={3}
          className="w-full resize-none rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
        />
        <div className="text-right text-xs text-white/30">
          {topic.length}/{MAX_TOPIC_LENGTH}
        </div>
      </div>

      {/* Platform Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          选择平台
        </label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPlatformChange(p.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                platform === p.value
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 border shadow-lg shadow-cyan-500/10"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              <span className="mr-1.5">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white/70">
          内容类型
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((ct) => (
            <button
              key={ct.value}
              onClick={() => onContentTypeChange(ct.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                contentType === ct.value
                  ? "bg-purple-500/20 border-purple-400/50 text-purple-300 border shadow-lg shadow-purple-500/10"
                  : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
          canGenerate
            ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-xl shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            : "bg-white/5 text-white/25 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            生成中...
          </span>
        ) : (
          "🔥 生成 10 个 Hook"
        )}
      </button>
    </div>
  );
}
