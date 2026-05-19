"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch {
      setLoggingOut(false);
    }
  }

  const linkClass = (href: string) =>
    `text-sm transition-colors ${
      pathname.startsWith(href)
        ? "text-coral font-medium"
        : "text-warm-muted hover:text-warm-text"
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-warm-bg/80 border-b border-warm-border/50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold text-warm-text tracking-wide"
          >
            深夜放映室
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/dramas" className={linkClass("/dramas")}>
              韩剧
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user === undefined ? (
            <div className="w-16 h-5 bg-warm-border/50 rounded animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-warm-text font-medium">
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-xs text-warm-muted hover:text-warm-text transition-colors disabled:opacity-50"
              >
                {loggingOut ? "退出中..." : "退出"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-warm-muted hover:text-warm-text transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 rounded-full bg-coral text-white text-xs font-medium hover:bg-coral-dark transition-colors"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
