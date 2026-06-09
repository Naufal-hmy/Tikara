# 🎫 Tikara — Aplikasi Pembelian Tiket Event

Tikara adalah aplikasi mobile untuk membeli tiket event, konser, dan pertunjukan. Dibangun menggunakan **React Native (Expo)** dengan backend **Supabase**.

## ✨ Fitur Utama

- 🔐 Login & Register dengan OTP
- 🏠 Beranda dengan carousel event & kategori
- 🔍 Explore & pencarian event
- 🎟️ Pembelian tiket (Silver & Gold)
- 💳 Simulasi Payment Gateway (QRIS, E-wallet, Saldo, Bank, Tunai)
- 💰 Top Up saldo dengan simulasi pembayaran
- 📱 QR Code tiket digital
- 🔖 Bookmark event favorit
- 📊 Riwayat transaksi
- 👤 Edit profil pengguna
- 📷 Scanner tiket (untuk admin/EO)

---

## 📋 Prasyarat

Sebelum menjalankan proyek ini, pastikan sudah menginstall:

| No | Software | Link Download | Keterangan |
|----|----------|--------------|------------|
| 1 | **Node.js** (v18 ke atas) | [nodejs.org](https://nodejs.org) | Pilih versi **LTS**, install seperti biasa |
| 2 | **Git** | [git-scm.com](https://git-scm.com) | Install dengan pengaturan default |
| 3 | **Expo Go** (di HP) | [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) / [App Store](https://apps.apple.com/app/expo-go/id982107779) | Untuk menjalankan app di HP |

### Cek apakah sudah terinstall:

Buka **Command Prompt** atau **Terminal**, ketik:

```bash
node --version
# Harus muncul v18.x.x atau lebih tinggi

git --version
# Harus muncul git version x.x.x
```

---

## 🚀 Cara Menjalankan Proyek

### 1. Clone (Download) Proyek

```bash
git clone https://github.com/Naufal-hmy/Tikara.git
```

### 2. Masuk ke Folder Proyek

```bash
cd Tikara
```

### 3. Install Dependencies

```bash
npm install
```

> ⏳ Proses ini membutuhkan waktu beberapa menit tergantung koneksi internet.
>
> ⚠️ Jika ada error, coba jalankan:
> ```bash
> npm install --legacy-peer-deps
> ```

### 4. Jalankan Aplikasi

```bash
npx expo start
```

Akan muncul QR Code di terminal.

### 5. Buka di HP

1. Pastikan **HP dan laptop/PC terhubung ke WiFi yang sama**
2. Buka aplikasi **Expo Go** di HP
3. **Scan QR Code** yang muncul di terminal
4. Tunggu proses bundling selesai (pertama kali bisa agak lama)
5. Aplikasi akan terbuka di HP! 🎉

---

## 🔧 Troubleshooting (Jika Ada Masalah)

| Masalah | Solusi |
|---------|--------|
| `expo: command not found` | Gunakan `npx expo start` (bukan `expo start`) |
| Error saat `npm install` | Coba `npm install --legacy-peer-deps` |
| QR Code tidak bisa di-scan | Coba `npx expo start --tunnel` |
| HP tidak terhubung | Pastikan HP & laptop di WiFi yang sama |
| Aplikasi stuck loading | Tutup Expo Go, scan ulang QR Code |
| Error "Network request failed" | Cek koneksi internet HP |

---

## 📁 Struktur Proyek

```
Tikara/
├── app/                    # Semua halaman aplikasi
│   ├── (tabs)/             # Tab navigasi (Home, Explore, Ticket, Profile)
│   ├── checkout.tsx        # Halaman checkout & pembayaran
│   ├── topup.tsx           # Halaman top up saldo
│   ├── buy-ticket.tsx      # Halaman beli tiket
│   ├── event-detail.tsx    # Detail event
│   └── ...
├── services/               # Logic bisnis & API calls
├── lib/                    # Konfigurasi Supabase
├── components/             # Komponen UI reusable
├── assets/                 # Gambar, ikon, font
└── package.json            # Dependencies proyek
```

---

## 🛠️ Tech Stack

- **Frontend:** React Native + Expo SDK 54
- **Routing:** Expo Router
- **Backend:** Supabase (PostgreSQL + Auth)
- **Language:** TypeScript

---

## 👨‍💻 Dibuat Oleh

**Naufal** — Proyek Mata Kuliah Mobile Semester 6
