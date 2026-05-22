"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Loader2,
  Trash2,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { EVENT_CATEGORIES, REMINDER_OPTIONS } from "@/lib/validations";

interface CalEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  color: string | null;
  location: string | null;
  reminder: number | null;
  recurrence: string | null;
  category: string | null;
}

export default function KalenderPage() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState("#6366f1");
  const [location, setLocation] = useState("");
  const [reminder, setReminder] = useState<number>(0);
  const [recurrence, setRecurrence] = useState("");
  const [category, setCategory] = useState("");

  const { data: events = [], isLoading } = useQuery<CalEvent[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/kalender");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/kalender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event berhasil ditambahkan");
      resetForm();
      setDialogOpen(false);
    },
    onError: () => toast.error("Gagal menambahkan event"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/kalender/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event berhasil diperbarui");
      resetForm();
      setDialogOpen(false);
    },
    onError: () => toast.error("Gagal memperbarui event"),
  });

  const patchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/kalender/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to patch");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Jadwal dipindahkan");
    },
    onError: () => toast.error("Gagal memindahkan jadwal"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/kalender/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event berhasil dihapus");
      setDeleteId(null);
    },
    onError: () => toast.error("Gagal menghapus event"),
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setAllDay(false);
    setColor("#6366f1");
    setLocation("");
    setReminder(0);
    setRecurrence("");
    setCategory("");
    setEditingEvent(null);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetForm();
    if (selectInfo.allDay) {
      setAllDay(true);
      setStartDate(format(selectInfo.start, "yyyy-MM-dd"));
      if (selectInfo.end) {
        const end = new Date(selectInfo.end);
        end.setDate(end.getDate() - 1);
        setEndDate(format(end, "yyyy-MM-dd"));
      }
    } else {
      setStartDate(format(selectInfo.start, "yyyy-MM-dd'T'HH:mm"));
      if (selectInfo.end) {
        setEndDate(format(selectInfo.end, "yyyy-MM-dd'T'HH:mm"));
      }
    }
    setDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find((e) => e.id === clickInfo.event.id);
    if (event) {
      setEditingEvent(event);
      setTitle(event.title);
      setDescription(event.description || "");
      setAllDay(event.allDay);
      if (event.allDay) {
        setStartDate(format(new Date(event.startDate), "yyyy-MM-dd"));
        setEndDate(event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd") : "");
      } else {
        setStartDate(format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"));
        setEndDate(event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : "");
      }
      setColor(event.color || "#6366f1");
      setLocation(event.location || "");
      setReminder(event.reminder || 0);
      setRecurrence(event.recurrence || "");
      setCategory(event.category || "");
      setDialogOpen(true);
    }
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    patchMutation.mutate({
      id: dropInfo.event.id,
      data: {
        startDate: dropInfo.event.start?.toISOString(),
        endDate: dropInfo.event.end?.toISOString(),
        allDay: dropInfo.event.allDay,
      },
    });
  };

  const handleEventResize = (resizeInfo: EventResizeDoneArg) => {
    patchMutation.mutate({
      id: resizeInfo.event.id,
      data: {
        startDate: resizeInfo.event.start?.toISOString(),
        endDate: resizeInfo.event.end?.toISOString(),
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      description: description || undefined,
      startDate: allDay ? new Date(startDate).toISOString() : new Date(startDate).toISOString(),
      endDate: endDate ? (allDay ? new Date(endDate).toISOString() : new Date(endDate).toISOString()) : undefined,
      allDay,
      color,
      location: location || undefined,
      reminder: reminder || undefined,
      recurrence: recurrence || undefined,
      category: category || undefined,
    };

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Convert events for FullCalendar
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate || undefined,
    allDay: event.allDay,
    backgroundColor: event.color || "#6366f1",
    borderColor: event.color || "#6366f1",
    extendedProps: {
      category: event.category,
      location: event.location,
    },
  }));

  // Browser notification for reminders
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      events.forEach((event) => {
        if (!event.reminder || event.reminder === 0) return;
        const eventStart = new Date(event.startDate);
        const reminderTime = new Date(
          eventStart.getTime() - event.reminder * 60 * 1000
        );

        const diff = Math.abs(now.getTime() - reminderTime.getTime());
        if (diff < 30000) {
          // within 30 seconds
          if (Notification.permission === "granted") {
            new Notification(`📅 ${event.title}`, {
              body: `Dimulai dalam ${event.reminder} menit${
                event.location ? ` di ${event.location}` : ""
              }`,
            });
          }
          toast.info(`📅 ${event.title} dimulai dalam ${event.reminder} menit`);
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [events]);

  // Get today's and upcoming events for sidebar
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const todayEvents = events.filter((e) => {
    const start = new Date(e.startDate);
    return start >= todayStart && start < todayEnd;
  });

  const upcomingEvents = events
    .filter((e) => new Date(e.startDate) >= todayEnd)
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            📅 Kalender
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Atur jadwal dan event kamu
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setStartDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
            setDialogOpen(true);
          }}
          className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="glass-card lg:col-span-3 overflow-hidden">
          <CardContent className="p-2 sm:p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                locale="id"
                events={calendarEvents}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={3}
                weekends={true}
                editable={true}
                droppable={true}
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                eventResize={handleEventResize}
                height="auto"
                aspectRatio={1.5}
                buttonText={{
                  today: "Hari Ini",
                  month: "Bulan",
                  week: "Minggu",
                  day: "Hari",
                  list: "Daftar",
                }}
                nowIndicator={true}
                slotMinTime="06:00:00"
                slotMaxTime="23:00:00"
              />
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Today */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Tidak ada jadwal
                </p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-lg bg-background/30 border-l-2 cursor-pointer hover:bg-background/50 transition-colors"
                      style={{ borderLeftColor: event.color || "#6366f1" }}
                      onClick={() => {
                        setEditingEvent(event);
                        setTitle(event.title);
                        setDescription(event.description || "");
                        setAllDay(event.allDay);
                        if (event.allDay) {
                          setStartDate(format(new Date(event.startDate), "yyyy-MM-dd"));
                          setEndDate(event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd") : "");
                        } else {
                          setStartDate(format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"));
                          setEndDate(event.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : "");
                        }
                        setColor(event.color || "#6366f1");
                        setLocation(event.location || "");
                        setReminder(event.reminder || 0);
                        setRecurrence(event.recurrence || "");
                        setCategory(event.category || "");
                        setDialogOpen(true);
                      }}
                    >
                      <p className="text-xs font-medium">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {event.allDay
                          ? "Sepanjang hari"
                          : format(new Date(event.startDate), "HH:mm")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-purple-400" />
                Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Tidak ada jadwal mendatang
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-background/30 transition-colors cursor-pointer"
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex flex-col items-center justify-center text-[9px] font-bold shrink-0"
                        style={{
                          backgroundColor: `${event.color || "#6366f1"}20`,
                          color: event.color || "#6366f1",
                        }}
                      >
                        <span>{format(new Date(event.startDate), "d")}</span>
                        <span className="text-[7px] uppercase">
                          {format(new Date(event.startDate), "MMM")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {event.allDay
                            ? "Sepanjang hari"
                            : format(new Date(event.startDate), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Legend */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {EVENT_CATEGORIES.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs">{cat.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="glass-card sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingEvent ? "Edit Event" : "Tambah Event"}</span>
              {editingEvent && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    setDialogOpen(false);
                    setDeleteId(editingEvent.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Event</Label>
              <Input
                placeholder="Contoh: Kuliah Algoritma"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-11 rounded-xl bg-background/50"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-background/30">
              <Label className="text-sm">Sepanjang hari</Label>
              <Switch checked={allDay} onCheckedChange={setAllDay} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Mulai</Label>
                <Input
                  type={allDay ? "date" : "datetime-local"}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="h-10 rounded-xl bg-background/50 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Selesai</Label>
                <Input
                  type={allDay ? "date" : "datetime-local"}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 rounded-xl bg-background/50 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={(val: string | null) => {
                const safeVal = val || "";
                setCategory(safeVal);
                const cat = EVENT_CATEGORIES.find((c) => c.name === safeVal);
                if (cat) setColor(cat.color);
              }}>
                <SelectTrigger className="h-10 rounded-xl bg-background/50">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Lokasi (opsional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Contoh: Ruang 301"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10 rounded-xl bg-background/50 pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pengingat</Label>
              <Select
                value={reminder.toString()}
                onValueChange={(val: string | null) => setReminder(parseInt(val || "0"))}
              >
                <SelectTrigger className="h-10 rounded-xl bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value.toString()}>
                      <div className="flex items-center gap-2">
                        <Bell className="h-3 w-3" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pengulangan</Label>
              <Select value={recurrence} onValueChange={(val: string | null) => setRecurrence(val || "")}>
                <SelectTrigger className="h-10 rounded-xl bg-background/50">
                  <SelectValue placeholder="Tidak berulang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak berulang</SelectItem>
                  <SelectItem value="daily">Setiap hari</SelectItem>
                  <SelectItem value="weekly">Setiap minggu</SelectItem>
                  <SelectItem value="monthly">Setiap bulan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi (opsional)</Label>
              <Textarea
                placeholder="Detail event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl bg-background/50 resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.color}
                    type="button"
                    onClick={() => setColor(cat.color)}
                    className={`h-7 w-7 rounded-full transition-all ${
                      color === cat.color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: cat.color }}
                    title={cat.name}
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
              ) : editingEvent ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Event"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Event yang dihapus tidak bisa dikembalikan.
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
