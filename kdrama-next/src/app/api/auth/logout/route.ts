import { clearTokenCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearTokenCookie();
    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "退出失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
