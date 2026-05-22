import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure user exists in our database
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split("@")[0],
      },
    });
  }

  // Fetch all dashboard data in parallel for faster loading
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const userId = dbUser.id;

  const [transactions, recentNotes, todayEvents, upcomingEvents] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        orderBy: { date: "desc" },
        take: 50, // Limit results for performance
      }),
      prisma.note.findMany({
        where: { userId },
        orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
        take: 4,
      }),
      prisma.event.findMany({
        where: {
          userId,
          startDate: { gte: startOfDay, lt: endOfDay },
        },
        orderBy: { startDate: "asc" },
      }),
      prisma.event.findMany({
        where: {
          userId,
          startDate: { gte: endOfDay },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      }),
    ]);

  const totalMasuk = transactions
    .filter((t) => t.type === "masuk")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalKeluar = transactions
    .filter((t) => t.type === "keluar")
    .reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalMasuk - totalKeluar;

  return (
    <DashboardContent
      userName={dbUser.name || "User"}
      saldo={saldo}
      totalMasuk={totalMasuk}
      totalKeluar={totalKeluar}
      recentTransactions={transactions.slice(0, 5)}
      recentNotes={recentNotes}
      todayEvents={todayEvents}
      upcomingEvents={upcomingEvents}
    />
  );
}
