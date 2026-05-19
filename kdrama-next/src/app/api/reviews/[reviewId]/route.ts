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
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        drama: { select: { id: true, tmdbId: true, title: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!review) {
      return Response.json(
        { success: false, error: "影评不存在" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: { review } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取影评失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
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
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "影评不存在" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return Response.json(
        { success: false, error: "只能编辑自己的影评" },
        { status: 403 }
      );
    }

    const { title, content, rating } = await request.json();
    const summary = content ? content.slice(0, 200) : undefined;

    const review = await prisma.review.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content, summary }),
        ...(rating !== undefined && { rating }),
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return Response.json({ success: true, data: { review } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "编辑影评失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
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
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "影评不存在" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return Response.json(
        { success: false, error: "只能删除自己的影评" },
        { status: 403 }
      );
    }

    await prisma.review.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除影评失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
