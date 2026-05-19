import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getDramaDetails } from "@/lib/tmdb";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { tmdbId } = await params;
  const tmdbIdNum = parseInt(tmdbId, 10);

  try {
    const drama = await prisma.drama.findUnique({
      where: { tmdbId: tmdbIdNum },
    });

    if (!drama) {
      return Response.json({ success: true, data: { reviews: [], drama: null } });
    }

    const reviews = await prisma.review.findMany({
      where: { dramaId: drama.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const result = reviews.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      rating: r.rating,
      likesCount: r.likesCount,
      createdAt: r.createdAt,
      author: r.author,
      commentCount: r._count.comments,
    }));

    return Response.json({ success: true, data: { reviews: result, drama } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取影评失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { tmdbId } = await params;
  const tmdbIdNum = parseInt(tmdbId, 10);

  const user = await requireAuth(request);
  if (!user) {
    return Response.json(
      { success: false, error: "请先登录" },
      { status: 401 }
    );
  }

  try {
    const { title, content, rating } = await request.json();

    if (!title || !content || rating == null) {
      return Response.json(
        { success: false, error: "请填写标题、内容和评分" },
        { status: 400 }
      );
    }

    let drama = await prisma.drama.findUnique({
      where: { tmdbId: tmdbIdNum },
    });

    if (!drama) {
      try {
        const show = await getDramaDetails(tmdbIdNum);
        drama = await prisma.drama.upsert({
          where: { tmdbId: tmdbIdNum },
          update: {
            title: show.name,
            year: show.first_air_date
              ? new Date(show.first_air_date).getFullYear()
              : 0,
            posterUrl: show.poster_path,
            backdropUrl: show.backdrop_path,
            synopsis: show.overview || "",
            rating: show.vote_average,
            episodes: show.number_of_episodes || 16,
          },
          create: {
            tmdbId: show.id,
            title: show.name,
            year: show.first_air_date
              ? new Date(show.first_air_date).getFullYear()
              : 0,
            posterUrl: show.poster_path,
            backdropUrl: show.backdrop_path,
            synopsis: show.overview || "",
            rating: show.vote_average,
            episodes: show.number_of_episodes || 16,
          },
        });
      } catch {
        drama = await prisma.drama.create({
          data: {
            tmdbId: tmdbIdNum,
            title: "Unknown Drama",
            year: 0,
            episodes: 16,
          },
        });
      }
    }

    const summary = content.slice(0, 200);

    const review = await prisma.review.create({
      data: {
        dramaId: drama.id,
        userId: user.id,
        title,
        content,
        summary,
        rating,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return Response.json(
      { success: true, data: { review } },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "发表影评失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
