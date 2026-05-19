import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await params;
  const id = parseInt(reviewId, 10);

  try {
    const comments = await prisma.comment.findMany({
      where: { reviewId: id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return Response.json({ success: true, data: { comments } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取评论失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

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
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return Response.json(
        { success: false, error: "评论内容不能为空" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return Response.json(
        { success: false, error: "影评不存在" },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        reviewId: id,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return Response.json(
      { success: true, data: { comment } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "发表评论失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
