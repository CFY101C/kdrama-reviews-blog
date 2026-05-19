"use client";

import { useState, useCallback } from "react";
import type { GenerateRequest, HookResult } from "@/lib/types";

interface UseGenerateReturn {
  generate: (req: GenerateRequest) => Promise<HookResult[]>;
  isLoading: boolean;
  error: string | null;
}

export function useGenerate(): UseGenerateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (req: GenerateRequest): Promise<HookResult[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || `请求失败 (${res.status})`;
        throw new Error(msg);
      }

      const data = await res.json();
      const hooks: HookResult[] = data.hooks.map(
        (h: HookResult, i: number) => ({
          ...h,
          id: `${Date.now()}-${i}`,
          isFavorite: false,
        }),
      );
      return hooks;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { generate, isLoading, error };
}
