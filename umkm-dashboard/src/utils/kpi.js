import { inventory as defaultInventory } from '../data/inventory'

// Bulan referensi: Oktober 2026
const REFERENCE_DATE = new Date('2026-10-01')
const END_OF_MONTH   = new Date('2026-10-31')

export function getProductStatus(product) {
  const { stok, terjualPerBulan, expired } = product
  if (expired) {
    const expDate = new Date(expired)
    if (expDate <= END_OF_MONTH) return 'expired'
    const daysUntilExpiry = (expDate - REFERENCE_DATE) / (1000 * 60 * 60 * 24)
    if (daysUntilExpiry <= 30) return 'hampir-expired'
  }
  if (terjualPerBulan > 0 && stok / terjualPerBulan > 3) return 'dead-stock'
  return 'normal'
}

export function getTotalPotentialLoss(items = defaultInventory) {
  return items.reduce((total, p) => {
    const status = getProductStatus(p)
    if (status === 'expired' || status === 'dead-stock') {
      return total + p.stok * p.hargaJual
    }
    return total
  }, 0)
}

export function getDeadStockCount(items = defaultInventory) {
  return items.filter(p => getProductStatus(p) === 'dead-stock').length
}

export function getExpiredThisMonthCount(items = defaultInventory) {
  return items.filter(p => getProductStatus(p) === 'expired').length
}

export function getHealthScore(items = defaultInventory) {
  const total = items.length
  if (total === 0) return 100
  const expired      = getExpiredThisMonthCount(items)
  const deadStock    = getDeadStockCount(items)
  const hampirExpired = items.filter(p => getProductStatus(p) === 'hampir-expired').length
  const penalty = expired * 10 + deadStock * 5 + hampirExpired * 2
  return Math.max(0, Math.round(100 - (penalty / total) * 10))
}

export function getStockByCategory(items = defaultInventory) {
  const map = {}
  items.forEach(p => {
    if (!map[p.kategori]) map[p.kategori] = { kategori: p.kategori, stok: 0, terjual: 0 }
    map[p.kategori].stok   += p.stok
    map[p.kategori].terjual += p.terjualPerBulan
  })
  return Object.values(map)
}

export function getStatusDistribution(items = defaultInventory) {
  const counts = { normal: 0, 'dead-stock': 0, 'hampir-expired': 0, expired: 0 }
  items.forEach(p => { counts[getProductStatus(p)]++ })
  return [
    { name: 'Normal',         value: counts.normal,           color: '#10B981' },
    { name: 'Dead-Stock',     value: counts['dead-stock'],    color: '#F59E0B' },
    { name: 'Hampir Expired', value: counts['hampir-expired'],color: '#FBBF24' },
    { name: 'Expired',        value: counts.expired,          color: '#EF4444' },
  ]
}
