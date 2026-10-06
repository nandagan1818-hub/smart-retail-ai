// Database CRM mini — segmentasi pelanggan toko
// Digunakan untuk mengarahkan teks promo ke segmen yang tepat

export const CRM_SEGMENTS = {
  setia: {
    label: 'Pelanggan Setia',
    emoji: '⭐',
    description: 'Pelanggan yang rutin belanja setiap minggu, nilai transaksi tinggi',
    color: 'text-amber-600 bg-amber-50',
    promoHook: 'Sebagai pelanggan setia kami, Anda mendapat penawaran eksklusif lebih awal!',
    channel: 'WhatsApp Broadcast List "VIP"',
  },
  berisiko: {
    label: 'Berisiko Churn',
    emoji: '🔔',
    description: 'Pelanggan aktif 3+ bulan lalu namun belum belanja 30 hari terakhir',
    color: 'text-orange-600 bg-orange-50',
    promoHook: 'Kami rindu kamu! Sudah lama tidak mampir — kami punya penawaran spesial untuk membuatmu kembali.',
    channel: 'WhatsApp Personal + Follow-up call',
  },
  baru: {
    label: 'Pelanggan Baru',
    emoji: '🆕',
    description: 'Pelanggan yang baru pertama kali atau baru 1-2x belanja',
    color: 'text-blue-600 bg-blue-50',
    promoHook: 'Selamat datang! Dapatkan promo spesial untuk pembelian pertamamu bersama kami.',
    channel: 'WhatsApp Welcome Message',
  },
  all: {
    label: 'Semua Pelanggan',
    emoji: '📢',
    description: 'Broadcast umum ke seluruh kontak pelanggan',
    color: 'text-gray-600 bg-gray-50',
    promoHook: 'Halo pelanggan setia kami! Ada penawaran menarik yang tidak boleh kamu lewatkan.',
    channel: 'WhatsApp Broadcast Umum',
  },
}

// Contoh data pelanggan (demo)
export const CUSTOMERS = [
  { id: 1, nama: 'Ibu Sari',    segmen: 'setia',   lastBuy: '2026-10-28', totalBelanja: 1_250_000 },
  { id: 2, nama: 'Pak Budi',    segmen: 'setia',   lastBuy: '2026-10-25', totalBelanja: 980_000  },
  { id: 3, nama: 'Ibu Dewi',    segmen: 'berisiko',lastBuy: '2026-09-15', totalBelanja: 560_000  },
  { id: 4, nama: 'Mas Andi',    segmen: 'berisiko',lastBuy: '2026-09-02', totalBelanja: 340_000  },
  { id: 5, nama: 'Ibu Rina',    segmen: 'baru',    lastBuy: '2026-10-30', totalBelanja: 85_000   },
  { id: 6, nama: 'Pak Hendra',  segmen: 'baru',    lastBuy: '2026-10-29', totalBelanja: 120_000  },
]
