import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const isAdmin = await getAdminSession();
  return Response.json({ success: true, data: { isAdmin } });
}
