// Kredensial demo — di produksi gunakan backend/JWT
// Role: Kasir (transaksi kasir, POS) | Pemilik (lihat semua, termasuk laporan & log)
export const USERS = [
  { username: 'kasir',    password: 'kasir123',   name: 'Kasir Toko',   role: 'Kasir'   },
  { username: 'pemilik',  password: 'pemilik123', name: 'Pemilik Toko', role: 'Pemilik' },
]

export const SESSION_KEY = 'smart_retail_session'
