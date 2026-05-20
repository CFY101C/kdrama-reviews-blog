import { prisma } from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

async function getStats() {
  const [users, reviews, dramas, comments] = await Promise.all([
    prisma.user.count(),
    prisma.review.count(),
    prisma.drama.count(),
    prisma.comment.count(),
  ]);

  const recentReviews = await prisma.review.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
      drama: { select: { title: true, tmdbId: true } },
    },
  });

  const recentUsers = await prisma.user.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return {
    stats: { users, reviews, dramas, comments },
    recentReviews: recentReviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    recentUsers: recentUsers.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}

export default async function AdminPage() {
  const { stats, recentReviews, recentUsers } = await getStats();

  return (
    <AdminDashboard
      stats={stats}
      recentReviews={recentReviews}
      recentUsers={recentUsers}
    />
  );
}
