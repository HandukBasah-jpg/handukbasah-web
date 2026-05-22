import { z } from "zod";

// ==================== KEUANGAN ====================
export const transactionSchema = z.object({
  type: z.enum(["masuk", "keluar"]),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  category: z.string().min(1, "Kategori harus dipilih"),
  description: z.string().optional(),
  date: z.string().min(1, "Tanggal harus diisi"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const KATEGORI_MASUK = [
  "Gaji",
  "Freelance",
  "Investasi",
  "Hadiah",
  "Lainnya",
] as const;

export const KATEGORI_KELUAR = [
  "Makan & Minum",
  "Transportasi",
  "Belanja",
  "Kuliah",
  "Hiburan",
  "Tagihan",
  "Kesehatan",
  "Lainnya",
] as const;

// ==================== NOTEPAD ====================
export const noteSchema = z.object({
  title: z.string().min(1, "Judul harus diisi"),
  content: z.string(),
  color: z.string().optional(),
  isPinned: z.boolean().optional(),
});

export type NoteInput = z.infer<typeof noteSchema>;

export const NOTE_COLORS = [
  { name: "Default", value: "#1e293b" },
  { name: "Merah", value: "#7f1d1d" },
  { name: "Hijau", value: "#14532d" },
  { name: "Biru", value: "#1e3a5f" },
  { name: "Ungu", value: "#3b0764" },
  { name: "Kuning", value: "#713f12" },
  { name: "Pink", value: "#831843" },
  { name: "Teal", value: "#134e4a" },
] as const;

// ==================== KALENDER ====================
export const eventSchema = z.object({
  title: z.string().min(1, "Judul event harus diisi"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai harus diisi"),
  endDate: z.string().optional(),
  allDay: z.boolean().optional(),
  color: z.string().optional(),
  location: z.string().optional(),
  reminder: z.number().optional(),
  recurrence: z.enum(["daily", "weekly", "monthly", ""]).optional(),
  category: z.string().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

export const EVENT_CATEGORIES = [
  { name: "Kuliah", color: "#6366f1" },
  { name: "Pribadi", color: "#22c55e" },
  { name: "Deadline", color: "#ef4444" },
  { name: "Rapat", color: "#f59e0b" },
  { name: "Olahraga", color: "#06b6d4" },
  { name: "Lainnya", color: "#8b5cf6" },
] as const;

export const REMINDER_OPTIONS = [
  { label: "Tidak ada", value: 0 },
  { label: "5 menit sebelum", value: 5 },
  { label: "10 menit sebelum", value: 10 },
  { label: "15 menit sebelum", value: 15 },
  { label: "30 menit sebelum", value: 30 },
  { label: "1 jam sebelum", value: 60 },
  { label: "1 hari sebelum", value: 1440 },
] as const;
