"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  StickyNote,
  Plus,
  Pin,
  PinOff,
  Trash2,
  Search,
  Loader2,
  Grid3X3,
  List,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { NOTE_COLORS } from "@/lib/validations";

interface Note {
  id: string;
  title: string;
  content: string;
  color: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function NotepadPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#1e293b");

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await fetch("/api/notepad");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/notepad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Catatan berhasil dibuat");
      resetForm();
      setDialogOpen(false);
    },
    onError: () => toast.error("Gagal membuat catatan"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/notepad/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Catatan berhasil diperbarui");
      resetForm();
      setDialogOpen(false);
    },
    onError: () => toast.error("Gagal memperbarui catatan"),
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const res = await fetch(`/api/notepad/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      });
      if (!res.ok) throw new Error("Failed to toggle pin");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notepad/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Catatan berhasil dihapus");
      setDeleteId(null);
    },
    onError: () => toast.error("Gagal menghapus catatan"),
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setColor("#1e293b");
    setEditingNote(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { title, content, color };

    if (editingNote) {
      updateMutation.mutate({ id: editingNote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || "#1e293b");
    setDialogOpen(true);
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  const NoteCard = ({ note }: { note: Note }) => (
    <div
      className="group relative rounded-xl p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-white/5 hover:border-white/10 min-h-[140px] flex flex-col"
      style={{ backgroundColor: note.color || "#1e293b" }}
      onClick={() => handleEdit(note)}
    >
      {/* Pin button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePinMutation.mutate({ id: note.id, isPinned: !note.isPinned });
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10"
      >
        {note.isPinned ? (
          <PinOff className="h-3.5 w-3.5 text-amber-400" />
        ) : (
          <Pin className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDeleteId(note.id);
        }}
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {note.isPinned && (
        <Pin className="h-3 w-3 text-amber-400 mb-1" />
      )}

      <h3 className="text-sm font-semibold line-clamp-1">{note.title}</h3>
      <p className="text-xs text-white/60 mt-1.5 line-clamp-4 flex-1 whitespace-pre-wrap">
        {note.content || "Catatan kosong..."}
      </p>
      <p className="text-[10px] text-white/40 mt-2">
        {format(new Date(note.updatedAt), "d MMM yyyy, HH:mm", {
          locale: localeId,
        })}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            📝 Notepad
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Simpan ide dan catatan penting kamu
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
                Catatan Baru
              </Button>
            }
          />
          <DialogContent className="glass-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? "Edit Catatan" : "Catatan Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Judul</Label>
                <Input
                  placeholder="Judul catatan..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-11 rounded-xl bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Isi Catatan</Label>
                <Textarea
                  placeholder="Tulis catatan kamu di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="rounded-xl bg-background/50 resize-none min-h-[160px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Warna</Label>
                <div className="flex gap-2 flex-wrap">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`h-8 w-8 rounded-full transition-all ${
                        color === c.value
                          ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingNote ? (
                  "Simpan Perubahan"
                ) : (
                  "Buat Catatan"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & View Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-card/50"
          />
        </div>
        <div className="flex gap-1 p-1 bg-card/50 rounded-xl">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-lg ${viewMode === "grid" ? "bg-indigo-500/20 text-indigo-400" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-lg ${viewMode === "list" ? "bg-indigo-500/20 text-indigo-400" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notes */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {searchQuery ? "Catatan tidak ditemukan" : "Belum ada catatan"}
          </p>
          {!searchQuery && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Buat Catatan Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
                <Pin className="h-3 w-3" />
                Disematkan
              </p>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                    : "space-y-2"
                }
              >
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Lainnya
                </p>
              )}
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                    : "space-y-2"
                }
              >
                {unpinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Catatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Catatan yang dihapus tidak bisa dikembalikan.
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
