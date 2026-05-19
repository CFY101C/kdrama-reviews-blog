import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    if (!email || !name || !password) {
      return Response.json(
        { success: false, error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { success: false, error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { success: false, error: "密码至少需要 6 个字符" },
        { status: 400 }
      );
    }

    if (name.trim().length < 1) {
      return Response.json(
        { success: false, error: "用户名不能为空" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { success: false, error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, name: name.trim(), password: hashed },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return Response.json({ success: true, data: { user } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "注册失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
