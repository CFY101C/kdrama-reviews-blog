"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !name || !password || !confirm) {
      setError("请填写所有字段");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("邮箱格式不正确");
      return;
    }

    if (name.trim().length < 1) {
      setError("用户名不能为空");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要 6 个字符");
      return;
    }

    if (password !== confirm) {
      setError("两次密码输入不一致");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim(), password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "注册失败");
        return;
      }

      router.push("/login");
    } catch {
      setError("网络错误，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-warm-text text-center mb-8">
          注册
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-warm-text mb-1.5"
            >
              用户名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-warm-border bg-white text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
              placeholder="你的昵称"
              autoComplete="name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-warm-text mb-1.5"
            >
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-warm-border bg-white text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-warm-text mb-1.5"
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-warm-border bg-white text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
              placeholder="至少 6 个字符"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-warm-text mb-1.5"
            >
              确认密码
            </label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-warm-border bg-white text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
              placeholder="再次输入密码"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-coral text-white text-sm font-medium hover:bg-coral-dark transition-colors disabled:opacity-50"
          >
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-warm-muted">
          已有账号？{" "}
          <Link
            href="/login"
            className="text-coral hover:text-coral-dark transition-colors"
          >
            登录
          </Link>
        </p>
      </div>
    </main>
  );
}
