"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Pencil,
  Trash2,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { KATEGORI_MASUK, KATEGORI_KELUAR } from "@/lib/validations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  createdAt: string;
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const CHART_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export default function KeuanganPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [type, setType] = useState<"masuk" | "keluar">("keluar");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await fetch("/api/keuangan");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaksi berhasil ditambahkan");
      resetForm();
      setDialogOpen(false);
    },
    onError: () => toast.error("Gagal menambahkan transaksi"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/keuangan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaksi berhasil diperbarui");
      resetForm();
      setDialogOpen(false);
    },
    onError: () => toast.error("Gagal memperbarui transaksi"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/keuangan/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaksi berhasil dihapus");
      setDeleteId(null);
    },
    onError: () => toast.error("Gagal menghapus transaksi"),
  });

  const resetForm = () => {
    setType("keluar");
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      type,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      date,
    };

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setType(t.type as "masuk" | "keluar");
    setAmount(t.amount.toString());
    setCategory(t.category);
    setDescription(t.description || "");
    setDate(format(new Date(t.date), "yyyy-MM-dd"));
    setDialogOpen(true);
  };

  // Calculations
  const totalMasuk = transactions
    .filter((t) => t.type === "masuk")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalKeluar = transactions
    .filter((t) => t.type === "keluar")
    .reduce((sum, t) => sum + t.amount, 0);
  const saldo = totalMasuk - totalKeluar;

  // Filter & search
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSearch =
      !searchQuery ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Category breakdown for pie chart
  const categoryBreakdown = transactions
    .filter((t) => t.type === "keluar")
    .reduce(
      (acc, t) => {
        const existing = acc.find((a) => a.name === t.category);
        if (existing) {
          existing.value += t.amount;
        } else {
          acc.push({ name: t.category, value: t.amount });
        }
        return acc;
      },
      [] as { name: string; value: number }[]
    )
    .sort((a, b) => b.value - a.value);

  // Monthly comparison chart data
  const monthlyData = [
    { name: "Pemasukan", value: totalMasuk, fill: "#22c55e" },
    { name: "Pengeluaran", value: totalKeluar, fill: "#ef4444" },
  ];

  const categories = type === "masuk" ? KATEGORI_MASUK : KATEGORI_KELUAR;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            💰 Keuangan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pemasukan dan pengeluaran kamu
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger
            render={
              <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/25">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
            }
          />
          <DialogContent className="glass-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex gap-2 p-1 bg-background/50 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setType("masuk");
                    setCategory("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === "masuk"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingUp className="h-3.5 w-3.5 inline mr-1.5" />
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("keluar");
                    setCategory("");
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === "keluar"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <TrendingDown className="h-3.5 w-3.5 inline mr-1.5" />
                  Keluar
                </button>
              </div>

              <div className="space-y-2">
                <Label>Jumlah (Rp)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={category} onValueChange={(val: string | null) => setCategory(val || "")} required>
                  <SelectTrigger className="h-11 rounded-xl bg-background/50">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Keterangan (opsional)</Label>
                <Textarea
                  placeholder="Contoh: Beli nasi goreng"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl bg-background/50 resize-none"
                  rows={2}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingTransaction ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card group hover:border-indigo-500/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saldo</p>
              <Wallet className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-bold gradient-text">{formatRupiah(saldo)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card group hover:border-emerald-500/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pemasukan</p>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatRupiah(totalMasuk)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card group hover:border-red-500/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pengeluaran</p>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{formatRupiah(totalKeluar)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Perbandingan Bulan Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: any) => formatRupiah(Number(value))}
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {categoryBreakdown.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Pengeluaran per Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatRupiah(Number(value))}
                      contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {categoryBreakdown.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      {cat.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card/50"
          />
        </div>
        <div className="flex gap-2">
          {["all", "masuk", "keluar"].map((f) => (
            <Button
              key={f}
              variant={filterType === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(f)}
              className={`rounded-xl ${
                filterType === f
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30"
                  : ""
              }`}
            >
              {f === "all" ? (
                <>
                  <Filter className="h-3 w-3 mr-1" />
                  Semua
                </>
              ) : f === "masuk" ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Masuk
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Keluar
                </>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Tidak ada transaksi</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 hover:bg-background/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        t.type === "masuk"
                          ? "bg-emerald-500/10"
                          : "bg-red-500/10"
                      }`}
                    >
                      {t.type === "masuk" ? (
                        <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {t.description || t.category}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] rounded-full py-0">
                          {t.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(t.date), "d MMMM yyyy", {
                            locale: localeId,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
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
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => handleEdit(t)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:text-red-400"
                        onClick={() => setDeleteId(t.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Transaksi yang dihapus tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-500 hover:bg-red-600"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
