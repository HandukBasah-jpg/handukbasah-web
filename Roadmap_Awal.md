# Roadmap: Personal Dashboard Web App 🚀

*(Dokumen ini adalah rekapitulasi roadmap dan rancangan awal (blueprint) yang kita bahas di awal mula proyek ini dibuat.)*

## Visi Proyek
Membuat *website* dasbor personal yang serba ada untuk kebutuhan pribadi, yang memiliki 3 fitur utama:
1. **Pencatatan Keuangan** (Uang masuk & keluar).
2. **Notepad** (Buku catatan digital).
3. **Kalender Pintar** (Jadwal perkuliahan/acara dengan pengingat ala Google Calendar).

Web ini didesain agar sepenuhnya gratis, cepat, dan modern.

---

## 🛠️ Rekomendasi Tech Stack (Teknologi yang Dipilih)
Sesuai permintaan untuk *personal use*, gratis, dan modern, berikut kombinasi yang kita gunakan:

1. **Framework Utama:** **Next.js (App Router)**
   - *Kenapa?* Standar industri saat ini, sangat cepat, mudah untuk digabung dengan backend (API Routes), dan sempurna untuk deploy ke Vercel.
2. **Database & Autentikasi:** **Supabase**
   - *Kenapa?* Menyediakan database PostgreSQL gratis (tier *free*) yang sangat mumpuni. Sudah termasuk fitur login/register (Supabase Auth) siap pakai yang aman.
3. **ORM (Penghubung Database):** **Prisma**
   - *Kenapa?* Sangat *developer-friendly*. Mengubah struktur tabel sangat mudah, punya keamanan tipe (*type-safe*) dengan TypeScript. Sangat cocok digabungkan dengan Supabase.
4. **UI Framework & Styling:** **Tailwind CSS v4 + shadcn/ui**
   - *Kenapa?* Tailwind membuat desain jauh lebih leluasa. `shadcn/ui` menyediakan komponen jadi (seperti tombol, *dropdown*, *modal*) yang terlihat sangat elegan (*premium/glassmorphism*) tanpa perlu ngoding CSS dari nol.
5. **Hosting / Deployment:** **Vercel**
   - *Kenapa?* Pembuat Next.js adalah Vercel. Kombinasi keduanya membuat *deploy* website bisa dilakukan dalam satu klik secara gratis dan performanya maksimal.

---

## 🗺️ Roadmap Eksekusi (Langkah demi Langkah)

### Fase 1: Setup & Fondasi (Selesai ✅)
- [x] Inisialisasi proyek Next.js dengan TypeScript.
- [x] Setup Tailwind CSS & konfigurasi tema desain (Dark Mode, warna *gradient*).
- [x] Instalasi *shadcn/ui* dan komponen dasarnya.
- [x] Merancang Skema Database (Prisma Schema) untuk `User`, `Transaction`, `Note`, dan `Event`.

### Fase 2: Autentikasi (Selesai ✅)
- [x] Menghubungkan aplikasi ke Supabase.
- [x] Membuat halaman Login / Register.
- [x] Membuat sistem *Middleware* agar dasbor hanya bisa diakses kalau sudah login.

### Fase 3: Modul Dasbor & Keuangan (Selesai ✅)
- [x] **Dasbor Utama:** Tampilan ringkasan uang, jadwal hari ini, dan catatan terbaru.
- [x] **Manajemen Keuangan:** Fitur *Input* uang masuk & keluar.
- [x] Klasifikasi kategori (Makanan, Gaji, Transportasi, dsb).
- [x] Visualisasi laporan memakai grafik (*Recharts*).

### Fase 4: Modul Notepad (Selesai ✅)
- [x] Halaman daftar catatan bergaya grid ala Google Keep.
- [x] Editor teks sederhana untuk menulis catatan.
- [x] Fitur pemberian warna *background* dan kemampuan menyematkan (*Pin*) catatan penting.

### Fase 5: Modul Kalender (Selesai ✅)
- [x] Tampilan kalender bulanan/mingguan menggunakan *FullCalendar*.
- [x] Fitur tambah jadwal perkuliahan atau event.
- [x] Fitur pengingat (*Reminder*) yang memicu *Browser Notification*.

### Fase 6: Evaluasi & Testing (Selesai ✅)
- [x] *Bug fixing* (Memperbaiki error koneksi Supabase & *TypeScript build*).
- [x] Cek fungsionalitas UI.

### Fase 7: Deployment (Tahap Selanjutnya ⏳)
- [ ] Push *source code* ke GitHub.
- [ ] *Connect* repositori GitHub ke **Vercel**.
- [ ] *Set up* *Environment Variables* (URL Supabase) di *dashboard* Vercel.
- [ ] *Live!* Web siap diakses dari HP atau Laptop mana saja.

---
*Roadmap ini sukses dijalankan hingga Fase 6 berkat kolaborasi di Antigravity IDE.*
