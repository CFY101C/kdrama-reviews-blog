import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Hook Lab — 爆款开头生成器",
  description:
    "输入主题，选择平台和内容类型，AI 一键生成 10 个不同风格的爆款开场 hook。支持小红书、抖音、B站、YouTube、X。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
