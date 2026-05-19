import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  const id = parseInt(commentId, 10);

  const user = await requireAuth(request);
  if (!user) {
    return Response.json(
      { success: false, error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    const existing = await prisma.comment.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "评论不存在" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return Response.json(
        { success: false, error: "只能删除自己的评论" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除评论失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
