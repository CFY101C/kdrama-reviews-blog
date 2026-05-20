import { NextRequest } from "next/server";
import { getAdminPassword, setAdminCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json(
        { success: false, error: "请输入管理密码" },
        { status: 400 }
      );
    }

    const adminPassword = getAdminPassword();

    if (password !== adminPassword) {
      return Response.json(
        { success: false, error: "密码错误" },
        { status: 401 }
      );
    }

    await setAdminCookie();

    return Response.json({ success: true, data: { message: "Logged in" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
