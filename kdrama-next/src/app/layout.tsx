import type { Metadata } from "next";
import { Noto_Serif_SC } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: {
    default: "深夜放映室 | K-Drama Reviews",
    template: "%s | 深夜放映室",
  },
  description:
    "一部好剧，一杯热茶，一个安静的夜晚。这里记录着每一部触动心灵的韩剧和它们背后的故事。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${notoSerif.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
