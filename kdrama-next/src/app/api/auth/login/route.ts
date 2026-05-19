import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, setTokenCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { success: false, error: "请输入邮箱和密码" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return Response.json(
        { success: false, error: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    await setTokenCookie(user.id, user.email);

    return Response.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
