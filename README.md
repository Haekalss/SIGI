# 🗺️ Sistem Informasi Geografis Bencana Indonesia

Sistem Informasi Geografis (SIG) berbasis website yang memvisualisasikan data Gempa Bumi dan Perkiraan Cuaca secara real-time di seluruh Indonesia menggunakan data dari BMKG.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Data Source**: BMKG API (Badan Meteorologi, Klimatologi, dan Geofisika)
- **Map Library**: Leaflet & react-leaflet
- **Styling**: Tailwind CSS
- **Base Map**: CartoDB Positron (minimalis)

## 📁 Struktur Proyek

```
sistem-bencana-id/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout dengan Leaflet CSS
│   │   ├── page.tsx             # Server Component utama
│   │   └── globals.css
│   ├── components/
│   │   ├── MapComponent.tsx     # Client Component untuk peta
│   │   ├── MapWrapper.tsx       # Wrapper untuk dynamic import
│   │   ├── Legend.tsx           # Komponen legend
│   │   └── InfoPanel.tsx        # Panel informasi statistik
│   └── lib/
│       └── bmkg.ts              # Service untuk fetch data BMKG
├── public/
│   └── marker-bencana.svg       # Custom marker icon
└── tsconfig.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi.

## 📊 Sumber Data

### Data Gempa dari BMKG

Aplikasi ini menggunakan API publik dari BMKG untuk data gempa real-time:
- **Gempa M 5.0+**: https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json
- Update setiap **5 menit**
- Menampilkan 20 gempa terkini dengan magnitude 5.0 atau lebih

### Data Cuaca

- Simulasi data cuaca untuk **25 kota** di Indonesia
- Mencakup kota besar dan kecil dari Sabang sampai Merauke
- Data: suhu, kelembaban, kecepatan angin, tekanan udara
- Marker emoji yang berbeda sesuai kondisi cuaca

## 🗺️ Fitur Peta

- **Basemap**: CartoDB Positron (style minimalis)
- **Marker Gempa**: Circle marker dengan ukuran berdasarkan magnitude
- **Marker Cuaca**: Emoji icon (☀️ cerah, ☁️ berawan, 🌧️ hujan, dll)
- **Interactive Popup**: Klik marker untuk detail informasi
- **Legend**: Panel legend yang dapat di-collapse
- **Info Panel**: Statistik real-time jumlah data

## 🎨 Fitur Utama

✅ Visualisasi gempa bumi real-time dari BMKG  
✅ Prakiraan cuaca untuk 25 kota di Indonesia  
✅ Interactive map dengan Leaflet  
✅ Custom markers dan popup  
✅ Responsive design  
✅ Auto-refresh data setiap 5 menit  
✅ No database required - semua data dari API

## 📱 Screenshots

*Map view dengan data gempa dan cuaca*

Data dikonversi ke format GeoJSON dengan koordinat `[longitude, latitude]`:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",

## 🔧 Konfigurasi

### Update Interval Data

Edit file [src/lib/bmkg.ts](src/lib/bmkg.ts) untuk mengubah interval cache:

```typescript
// Ubah nilai revalidate (dalam detik)
next: { revalidate: 300 }  // 5 menit
next: { revalidate: 60 }   // 1 menit
next: { revalidate: 1800 } // 30 menit
```

### Menambah/Mengurangi Kota Cuaca

Edit array `cities` di [src/lib/bmkg.ts](src/lib/bmkg.ts):

```typescript
const cities = [
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  // Tambah kota baru di sini
];
```

## 📝 Catatan Penting

1. **Koordinat GeoJSON**: Selalu gunakan format `[longitude, latitude]`
2. **SSR**: MapComponent menggunakan `dynamic import` dengan `ssr: false` karena Leaflet memerlukan `window` object
3. **Data Real-time**: Data gempa diambil langsung dari BMKG API tanpa database

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [BMKG Data Terbuka](https://data.bmkg.go.id/)

## 📄 License

MIT

## 🚀 Deploy on Vercel

Deploy aplikasi Next.js dengan mudah menggunakan [Vercel Platform](https://vercel.com/new).

Tidak perlu environment variables karena semua data berasal dari API publik BMKG.
