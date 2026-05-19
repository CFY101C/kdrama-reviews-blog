import type { Platform, ContentType } from "./types";

export const PLATFORMS: { value: Platform; label: string; emoji: string }[] = [
  { value: "xiaohongshu", label: "小红书", emoji: "📕" },
  { value: "douyin", label: "抖音", emoji: "🎵" },
  { value: "bilibili", label: "B站", emoji: "📺" },
  { value: "youtube", label: "YouTube", emoji: "▶️" },
  { value: "x", label: "X", emoji: "🐦" },
];

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "video", label: "视频" },
  { value: "image-text", label: "图文" },
  { value: "product-ad", label: "产品广告" },
  { value: "tutorial", label: "教程" },
  { value: "opinion", label: "观点帖" },
];

export const STYLE_DIMENSIONS = [
  "悬念反转型 — 制造认知反差，前半句建立预期，后半句打破",
  "数据冲击型 — 用具体数字增强可信度和冲击力",
  "痛点共鸣型 — 直接戳中目标用户的深层焦虑或困扰",
  "身份标签型 — 用'XX人一定要看'建立身份认同",
  "结果承诺型 — 明确告诉用户在N秒/分钟/天内能得到什么",
  "反常识型 — 挑战常规认知，让人忍不住想验证",
  "故事开场型 — 一句微型叙事，制造画面感和代入感",
  "提问互动型 — 用精准问题引发评论欲和参与感",
  "权威背书型 — 借用行业专家/大牌/数据来源建立信任",
  "紧迫感型 — 制造稀缺或时效压力，促使用户立即行动",
];

export const MAX_TOPIC_LENGTH = 100;
export const MAX_HISTORY_SIZE = 50;

export const STORAGE_KEYS = {
  history: "ai-hook-lab-history",
  favorites: "ai-hook-lab-favorites",
} as const;
