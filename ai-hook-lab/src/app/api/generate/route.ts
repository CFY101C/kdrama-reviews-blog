import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { GenerateRequest } from "@/lib/types";
import { MAX_TOPIC_LENGTH, STYLE_DIMENSIONS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置 API Key。请在 .env.local 中设置 LLM_API_KEY。" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as GenerateRequest;

    if (!body.topic || typeof body.topic !== "string") {
      return NextResponse.json({ error: "请输入主题" }, { status: 400 });
    }

    const topic = body.topic.slice(0, MAX_TOPIC_LENGTH).trim();
    if (!topic) {
      return NextResponse.json({ error: "请输入有效的主题" }, { status: 400 });
    }

    const platformNames: Record<string, string> = {
      xiaohongshu: "小红书",
      douyin: "抖音",
      bilibili: "B站",
      youtube: "YouTube",
      x: "X (Twitter)",
    };

    const typeNames: Record<string, string> = {
      video: "视频",
      "image-text": "图文",
      "product-ad": "产品广告",
      tutorial: "教程",
      opinion: "观点帖",
    };

    const platform = platformNames[body.platform] || body.platform;
    const contentType = typeNames[body.contentType] || body.contentType;

    const styleList = STYLE_DIMENSIONS.map((s, i) => `${i + 1}. ${s}`).join(
      "\n",
    );

    const systemPrompt = `你是一位顶级社交媒体内容策略师，擅长为各大平台撰写高点击率、高互动率的开场 hook。

平台：${platform}
内容类型：${contentType}
主题：${topic}

你需要生成 10 个不同风格的 hook 开场白。每个 hook 必须使用下面指定的风格维度中的一个（10 个 hook 对应 10 种风格，每种风格使用一次）：

${styleList}

严格要求：
- 每个 hook 20-60 字，简洁有力
- 针对 ${platform} 平台的语言风格和受众偏好
- 只返回纯 JSON 对象，不要任何 markdown 包裹，不要代码块标记
- 对象格式：{ "hooks": [ ... ] }
- hooks 数组中每个元素格式为：
  {
    "content": "hook文案",
    "styleTag": "风格名称（如：悬念反转型）",
    "clickScore": 数字1-5,
    "reason": "一句话推荐理由"
  }
- 返回10个元素，按 clickScore 从高到低排序`;

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.LLM_BASE_URL || "https://api.openai.com/v1",
    });

    const model =
      process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `为主题"${topic}"生成10个hook` },
      ],
      temperature: 0.9,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "AI 未返回有效响应，请重试" },
        { status: 500 },
      );
    }

    let parsed: {
      hooks?: Array<{
        content: string;
        styleTag: string;
        clickScore: number;
        reason: string;
      }>;
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "AI 返回格式异常，请重试" },
        { status: 500 },
      );
    }

    const hooks = parsed.hooks || (Array.isArray(parsed) ? parsed : []);

    if (!Array.isArray(hooks) || hooks.length === 0) {
      return NextResponse.json(
        { error: "AI 未生成有效 hook，请重试" },
        { status: 500 },
      );
    }

    // allow up to 10 hooks
    const results = hooks.slice(0, 10).map((h) => ({
      content: String(h.content || ""),
      styleTag: String(h.styleTag || ""),
      clickScore: Math.min(5, Math.max(1, Number(h.clickScore) || 3)),
      reason: String(h.reason || ""),
    }));

    return NextResponse.json({ hooks: results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "服务异常，请重试";

    console.error("Generate error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
