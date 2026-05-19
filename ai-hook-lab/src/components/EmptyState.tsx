"use client";

interface EmptyStateProps {
  hasApiKey: boolean;
}

export default function EmptyState({ hasApiKey }: EmptyStateProps) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center py-20">
      {hasApiKey ? (
        <>
          <div className="text-6xl mb-6">🔥</div>
          <h3 className="text-2xl font-bold text-white mb-3">
            开始生成 Hook
          </h3>
          <p className="text-white/35 text-base leading-relaxed">
            输入主题，选择平台和内容类型，
            <br />
            一键生成 10 个不同风格的爆款开场
          </p>
        </>
      ) : (
        <>
          <div className="text-6xl mb-6">🔑</div>
          <h3 className="text-2xl font-bold text-white mb-3">
            需要配置 API Key
          </h3>
          <p className="text-white/35 text-base leading-relaxed mb-2">
            在项目根目录的 <code className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 text-sm">.env.local</code> 中设置：
          </p>
          <div className="inline-block text-left text-sm text-white/40 bg-white/5 rounded-xl px-4 py-3 font-mono">
            LLM_API_KEY=your-api-key-here
            <br />
            LLM_BASE_URL=https://api.openai.com/v1
            <br />
            LLM_MODEL=gpt-4o-mini
          </div>
          <p className="text-white/20 text-sm mt-4">
            支持 OpenAI 及所有兼容接口（DeepSeek、通义千问等）
          </p>
        </>
      )}
    </div>
  );
}
