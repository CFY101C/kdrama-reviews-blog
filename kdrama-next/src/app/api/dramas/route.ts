import { NextRequest } from "next/server";
import {
  searchMulti,
  getTrendingDramas,
  getDramasByGenre,
  type TmdbMultiResult,
} from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";

async function upsertShow(item: TmdbMultiResult) {
  if (!item.first_air_date || !item.name) return;
  const year = new Date(item.first_air_date).getFullYear();
  await prisma.drama.upsert({
    where: { tmdbId: item.id },
    update: {
      title: item.name,
      year,
      posterUrl: item.poster_path,
      backdropUrl: null,
      synopsis: item.overview || "",
      rating: item.vote_average ?? 0,
    },
    create: {
      tmdbId: item.id,
      title: item.name,
      year,
      posterUrl: item.poster_path,
      backdropUrl: null,
      synopsis: item.overview || "",
      rating: item.vote_average ?? 0,
      episodes: 16,
    },
  });
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  const genre = request.nextUrl.searchParams.get("genre");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1;

  try {
    if (q) {
      const result = await searchMulti(q, page);

      const shows: TmdbMultiResult[] = [];
      const people: TmdbMultiResult[] = [];

      for (const item of result.results) {
        if (item.media_type === "tv") {
          shows.push(item);
          await upsertShow(item);
        } else if (
          item.media_type === "person" &&
          item.known_for_department === "Acting"
        ) {
          people.push(item);
        }
      }

      return Response.json({
        success: true,
        data: { shows, people },
        meta: {
          page: result.page,
          totalPages: result.total_pages,
          totalResults: result.total_results,
        },
      });
    }

    let result;
    if (genre) {
      result = await getDramasByGenre(parseInt(genre, 10), page);
    } else {
      result = await getTrendingDramas(page);
    }

    for (const show of result.results) {
      if (show.first_air_date && show.name) {
        const year = new Date(show.first_air_date).getFullYear();
        await prisma.drama.upsert({
          where: { tmdbId: show.id },
          update: {
            title: show.name,
            year,
            posterUrl: show.poster_path,
            backdropUrl: show.backdrop_path,
            synopsis: show.overview || "",
            rating: show.vote_average,
          },
          create: {
            tmdbId: show.id,
            title: show.name,
            year,
            posterUrl: show.poster_path,
            backdropUrl: show.backdrop_path,
            synopsis: show.overview || "",
            rating: show.vote_average,
            episodes: 16,
          },
        });
      }
    }

    return Response.json({
      success: true,
      data: { shows: result.results, people: [] },
      meta: {
        page: result.page,
        totalPages: result.total_pages,
        totalResults: result.total_results,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取韩剧失败";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
