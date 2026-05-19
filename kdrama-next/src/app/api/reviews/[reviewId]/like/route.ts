import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await params;
  const id = parseInt(reviewId, 10);

  const user = await requireAuth(request);
  if (!user) {
    return Response.json(
      { success: false, error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return Response.json(
        { success: false, error: "影评不存在" },
        { status: 404 }
      );
    }

    const existing = await prisma.like.findUnique({
      where: { reviewId_userId: { reviewId: id, userId: user.id } },
    });

    let liked: boolean;
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({
        data: { reviewId: id, userId: user.id },
      });
      liked = true;
    }

    const likesCount = await prisma.like.count({
      where: { reviewId: id },
    });

    await prisma.review.update({
      where: { id },
      data: { likesCount },
    });

    return Response.json({ success: true, data: { liked, likesCount } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "操作失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
