import { useState } from 'react'
import { inventory as initialData, CATEGORIES as initialCategories } from '../data/inventory'

export function useInventory() {
  const [items, setItems] = useState(initialData)

  const categories = ['Semua', ...new Set(items.map(p => p.kategori))]

  function addItem(product) {
    const newId = items.length > 0 ? Math.max(...items.map(p => p.id)) + 1 : 1
    setItems(prev => [...prev, { ...product, id: newId }])
  }

  function addMany(products) {
    setItems(prev => {
      let maxId = prev.length > 0 ? Math.max(...prev.map(p => p.id)) : 0
      const newItems = products.map(p => ({ ...p, id: ++maxId, stokMin: p.stokMin ?? 5 }))
      return [...prev, ...newItems]
    })
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  function deleteMany(ids) {
    const set = new Set(ids)
    setItems(prev => prev.filter(p => !set.has(p.id)))
  }

  function reduceStock(id, qty) {
    setItems(prev =>
      prev.map(p => p.id === id ? { ...p, stok: Math.max(0, p.stok - qty) } : p)
    )
  }

  return { items, categories, addItem, addMany, deleteItem, deleteMany, reduceStock }
}
