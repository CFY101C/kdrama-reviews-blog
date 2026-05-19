export type Platform = "xiaohongshu" | "douyin" | "bilibili" | "youtube" | "x";

export type ContentType = "video" | "image-text" | "product-ad" | "tutorial" | "opinion";

export interface HookResult {
  id: string;
  content: string;
  styleTag: string;
  clickScore: number;
  reason: string;
  isFavorite: boolean;
}

export interface GenerationRecord {
  id: string;
  topic: string;
  platform: Platform;
  contentType: ContentType;
  hooks: HookResult[];
  createdAt: number;
}

export interface GenerateRequest {
  topic: string;
  platform: Platform;
  contentType: ContentType;
}

export interface GenerateResponse {
  hooks: Omit<HookResult, "id" | "isFavorite">[];
}

export interface APIError {
  error: string;
}
