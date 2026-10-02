import { useState } from 'react'
import { inventory as initialData, CATEGORIES as initialCategories } from '../data/inventory'

export function useInventory() {
  const [items, setItems] = useState(initialData)

  const categories = ['Semua', ...new Set(items.map(p => p.kategori))]

  function addItem(product) {
    const newId = items.length > 0 ? Math.max(...items.map(p => p.id)) + 1 : 1
    setItems(prev => [...prev, { ...product, id: newId }])
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  function deleteMany(ids) {
    const set = new Set(ids)
    setItems(prev => prev.filter(p => !set.has(p.id)))
  }

  return { items, categories, addItem, deleteItem, deleteMany }
}
