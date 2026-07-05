# Panduan Deploy Aplikasi Setoran Tahfidz (Gratis)

Panduan ini ditulis untuk kamu yang belum pernah deploy website. Ikuti urutannya,
jangan lompat. Total waktu kira-kira 20-30 menit untuk pertama kali.

Kamu akan pakai 3 layanan, semuanya **gratis**:
- **Supabase** → tempat data (database) tersimpan
- **GitHub** → tempat menyimpan kode aplikasi
- **Vercel** → yang membuat aplikasinya online (hosting)

---

## BAGIAN 1 — Setup Database di Supabase

1. Buka https://supabase.com → klik **Start your project** → daftar pakai email atau akun GitHub.
2. Klik **New project**. Isi:
   - Name: `tahfidz-tracker` (bebas)
   - Database Password: buat password apa saja, **simpan/catat**, tidak akan dipakai lagi di panduan ini tapi baik untuk disimpan.
   - Region: pilih yang terdekat (misal Singapore).
3. Tunggu 1-2 menit sampai project selesai dibuat.
4. Di sidebar kiri, klik ikon **SQL Editor** → klik **New query**.
5. Buka file **`supabase-setup.sql`** yang aku sertakan, copy semua isinya, paste ke kotak query di Supabase.
6. Klik tombol **Run** (atau Ctrl+Enter). Harus muncul "Success. No rows returned" — artinya tabel sudah dibuat.
7. Di sidebar kiri, klik ikon **Project Settings** (gerigi) → **Data API**. Kamu akan lihat:
   - **Project URL** → copy, ini nanti jadi `VITE_SUPABASE_URL`
   - Di bagian **Project API keys**, copy yang **`anon` `public`** → ini nanti jadi `VITE_SUPABASE_ANON_KEY`
   - Simpan dua nilai ini di catatan sementara (Notes/Notepad), akan dipakai di Bagian 3.

---

## BAGIAN 2 — Upload Kode ke GitHub

1. Buka https://github.com → **Sign up** kalau belum punya akun (gratis).
2. Setelah login, klik tombol **+** di kanan atas → **New repository**.
3. Isi **Repository name**: `tahfidz-tracker` → pilih **Public** atau **Private** (bebas, keduanya gratis) → klik **Create repository**.
4. Di halaman repo yang baru dibuat, cari link kecil bertuliskan **"uploading an existing file"** → klik itu.
5. Di komputer, extract (unzip) folder project yang aku berikan. Buka folder hasil extract-nya.
6. **Select semua file & folder** di dalamnya (Ctrl+A / Cmd+A), lalu **drag & drop** semuanya ke halaman upload GitHub tadi.
   - Pastikan struktur foldernya tetap (folder `src` ikut ter-upload sebagai folder, bukan file lepas).
7. Scroll ke bawah, klik **Commit changes**.

Kode kamu sekarang sudah ada di GitHub.

---

## BAGIAN 3 — Deploy ke Vercel

1. Buka https://vercel.com → **Sign Up** → pilih **Continue with GitHub** (paling gampang, otomatis terhubung).
2. Setelah masuk dashboard, klik **Add New...** → **Project**.
3. Di daftar repository, cari `tahfidz-tracker` → klik **Import**.
4. Vercel otomatis mendeteksi ini project Vite — biarkan pengaturan default.
5. Buka bagian **Environment Variables**, tambahkan 2 baris:
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | (paste Project URL dari Supabase tadi) |
   | `VITE_SUPABASE_ANON_KEY` | (paste anon public key dari Supabase tadi) |
6. Klik **Deploy**. Tunggu 1-2 menit.
7. Setelah selesai, kamu akan dapat link seperti `tahfidz-tracker.vercel.app` — itu link aplikasi kamu yang sudah online!

Share link itu ke semua anggota kelompok. Mereka tidak perlu install apa-apa, cukup buka link-nya dari browser HP/laptop.

---

## Kalau Nanti Mau Ada Perubahan Aplikasi

1. Minta aku ubah kodenya di chat ini (misalnya "tambah kolom X", "ubah warna jadi Y").
2. Aku kasih kamu file `App.jsx` (atau file lain) versi terbaru.
3. Di GitHub, masuk ke repo `tahfidz-tracker` → klik file yang mau diganti (misal `src/App.jsx`) → klik ikon **pensil (Edit)** di kanan atas → **hapus semua isi lama, paste isi baru** → scroll bawah → **Commit changes**.
4. Vercel otomatis mendeteksi perubahan dan re-deploy sendiri dalam 1-2 menit. Tidak perlu setting ulang apa pun.

---

## Catatan Penting

- **Tidak ada sistem login/password** di aplikasi ini — siapa pun yang punya link bisa mengisi & melihat data. Ini sengaja dibuat sederhana untuk kemudahan anggota kelompok. Kalau nanti perlu perlindungan tambahan (misal PIN sederhana), bisa aku tambahkan.
- **Backup data**: gunakan tombol **Ekspor CSV** di tab Laporan secara berkala (misal tiap akhir bulan) sebagai cadangan.
- Supabase gratis (tier Free) cukup untuk ratusan/ribuan baris data kelompok tahfidz — tidak perlu upgrade kecuali datanya sangat besar.
- Kalau proses upload/deploy ada yang error atau bingung di tengah jalan, screenshot saja pesan errornya dan kirim ke aku, nanti aku bantu troubleshoot.
