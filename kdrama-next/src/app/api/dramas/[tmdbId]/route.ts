import { getDramaDetails, getDramaCredits, mapGenres } from "@/lib/tmdb";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { tmdbId } = await params;
  const id = parseInt(tmdbId, 10);

  if (isNaN(id)) {
    return Response.json({ success: false, error: "Invalid TMDB ID" }, { status: 400 });
  }

  try {
    const [show, credits] = await Promise.all([
      getDramaDetails(id),
      getDramaCredits(id),
    ]);

    const year = show.first_air_date
      ? new Date(show.first_air_date).getFullYear()
      : 0;
    const genreNames = mapGenres(show.genres || []);
    const director = credits.crew
      .filter((c) => c.job === "Director")
      .map((c) => c.name)
      .join("、");
    const writer = credits.crew
      .filter((c) => c.department === "Writing")
      .map((c) => c.name)
      .slice(0, 3)
      .join("、");
    const cast = credits.cast
      .slice(0, 10)
      .map((c) => c.name)
      .join("、");

    await prisma.drama.upsert({
      where: { tmdbId: id },
      update: {
        title: show.name,
        year,
        episodes: show.number_of_episodes || 16,
        cast,
        director,
        writer,
        genre: genreNames,
        posterUrl: show.poster_path,
        backdropUrl: show.backdrop_path,
        synopsis: show.overview || "",
        rating: show.vote_average,
      },
      create: {
        tmdbId: id,
        title: show.name,
        year,
        episodes: show.number_of_episodes || 16,
        cast,
        director,
        writer,
        genre: genreNames,
        posterUrl: show.poster_path,
        backdropUrl: show.backdrop_path,
        synopsis: show.overview || "",
        rating: show.vote_average,
      },
    });

    return Response.json({
      success: true,
      data: { show, credits },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch drama details";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
