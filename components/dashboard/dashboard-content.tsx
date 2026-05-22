"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  StickyNote,
  CalendarDays,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Button } from "@/components/ui/button";

interface DashboardContentProps {
  userName: string;
  saldo: number;
  totalMasuk: number;
  totalKeluar: number;
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    category: string;
    description: string | null;
    date: Date;
  }[];
  recentNotes: {
    id: string;
    title: string;
    content: string;
    color: string | null;
    isPinned: boolean;
    updatedAt: Date;
  }[];
  todayEvents: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date | null;
    color: string | null;
    location: string | null;
    allDay: boolean;
    category: string | null;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date | null;
    color: string | null;
    location: string | null;
    allDay: boolean;
    category: string | null;
  }[];
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DashboardContent({
  userName,
  saldo,
  totalMasuk,
  totalKeluar,
  recentTransactions,
  recentNotes,
  todayEvents,
  upcomingEvents,
}: DashboardContentProps) {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {userName}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, d MMMM yyyy", { locale: localeId })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo */}
        <Card className="glass-card overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Saldo
              </p>
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Wallet className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold gradient-text">
              {formatRupiah(saldo)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        {/* Pemasukan */}
        <Card className="glass-card overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pemasukan
              </p>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {formatRupiah(totalMasuk)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>

        {/* Pengeluaran */}
        <Card className="glass-card overflow-hidden group hover:border-red-500/30 transition-all duration-300">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pengeluaran
              </p>
              <div className="h-9 w-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {formatRupiah(totalKeluar)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-indigo-400" />
              Transaksi Terbaru
            </CardTitle>
            <Link href="/keuangan">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-indigo-400">
                Lihat Semua
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pb-4">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada transaksi</p>
                <Link href="/keuangan">
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl">
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Transaksi
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                          t.type === "masuk"
                            ? "bg-emerald-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {t.type === "masuk" ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {t.description || t.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.category} •{" "}
                          {format(new Date(t.date), "d MMM", {
                            locale: localeId,
                          })}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        t.type === "masuk"
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {t.type === "masuk" ? "+" : "-"}
                      {formatRupiah(t.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today Events */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-400" />
              Jadwal Hari Ini
            </CardTitle>
            <Link href="/kalender">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-blue-400">
                Lihat Semua
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pb-4">
            {todayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada jadwal hari ini</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors border-l-2"
                    style={{ borderLeftColor: event.color || "#6366f1" }}
                  >
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {event.allDay
                          ? "Sepanjang hari"
                          : format(new Date(event.startDate), "HH:mm")}
                        {event.endDate &&
                          !event.allDay &&
                          ` - ${format(new Date(event.endDate), "HH:mm")}`}
                      </p>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {event.location}
                        </p>
                      </div>
                    )}
                    {event.category && (
                      <Badge
                        variant="secondary"
                        className="mt-2 text-[10px] rounded-full"
                      >
                        {event.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notes */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-amber-400" />
              Catatan Terbaru
            </CardTitle>
            <Link href="/notepad">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-amber-400">
                Lihat Semua
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pb-4">
            {recentNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada catatan</p>
                <Link href="/notepad">
                  <Button variant="outline" size="sm" className="mt-3 rounded-xl">
                    <Plus className="h-3 w-3 mr-1" />
                    Buat Catatan
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {recentNotes.map((note) => (
                  <Link key={note.id} href={`/notepad/${note.id}`}>
                    <div
                      className="p-3 rounded-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-28 flex flex-col"
                      style={{
                        backgroundColor: note.color || "#1e293b",
                      }}
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {note.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 flex-1">
                        {note.content || "Kosong"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-auto">
                        {format(new Date(note.updatedAt), "d MMM", {
                          locale: localeId,
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              Jadwal Mendatang
            </CardTitle>
            <Link href="/kalender">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-purple-400">
                Lihat Semua
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pb-4">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Tidak ada jadwal mendatang</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors"
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        backgroundColor: `${event.color || "#6366f1"}20`,
                        color: event.color || "#6366f1",
                      }}
                    >
                      <span>{format(new Date(event.startDate), "d")}</span>
                      <span className="text-[8px] uppercase">
                        {format(new Date(event.startDate), "MMM")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.allDay
                          ? "Sepanjang hari"
                          : format(new Date(event.startDate), "HH:mm")}
                        {event.category && ` • ${event.category}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
