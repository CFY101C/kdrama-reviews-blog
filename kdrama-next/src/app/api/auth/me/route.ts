import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return Response.json({ success: true, data: { user: null } });
    }
    return Response.json({ success: true, data: { user } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取用户信息失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
