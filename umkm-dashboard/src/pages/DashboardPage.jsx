import { useState } from 'react'
import SummaryCards from '../components/SummaryCards'
import StockCharts from '../components/StockCharts'
import ActionTable from '../components/ActionTable'
import AgentChatWidget from '../components/AgentChatWidget'
import AlertBanner from '../components/AlertBanner'
import AddProductModal from '../components/AddProductModal'
import LoginPage from './LoginPage'
import { useAuth } from '../hooks/useAuth'
import { useInventory } from '../hooks/useInventory'
import { LayoutDashboard, ShoppingBag, LogOut, PackagePlus } from 'lucide-react'

const ROLE_COLOR = {
  Admin:   'bg-blue-100 text-blue-700',
  Kasir:   'bg-emerald-100 text-emerald-700',
  Pemilik: 'bg-purple-100 text-purple-700',
}

export default function App() {
  const { user, login, logout } = useAuth()
  const { items, categories, addItem, deleteItem, deleteMany } = useInventory()
  const [promoProduct, setPromoProduct] = useState(null)
  const [showAddModal, setShowAddModal]  = useState(false)

  // Tampilkan halaman login jika belum autentikasi
  if (!user) {
    return <LoginPage onLogin={login} />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Smart Retail AI</p>
              <p className="text-xs text-gray-400">UMKM Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
            <LayoutDashboard size={16} />
            Dashboard
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <PackagePlus size={16} />
            Tambah Produk
          </button>
        </nav>
        {/* User info di sidebar */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
              <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLOR[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
          >
            <LogOut size={13} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-800">Dashboard Inventaris</h1>
            <p className="text-xs text-gray-400">Periode: Oktober 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-500">AI Aktif</span>
            </div>
            {/* User badge di header (untuk mobile) */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 lg:hidden">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{user.name}</span>
              <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors ml-1">
                <LogOut size={13} />
              </button>
            </div>
            {/* User badge di header (desktop) */}
            <div className="hidden lg:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{user.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLOR[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {user.role}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <AlertBanner items={items} />
          <SummaryCards items={items} />

          <section>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Analisis Visual</h2>
            <StockCharts items={items} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Data Inventaris</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PackagePlus size={13} />
                Tambah Produk
              </button>
            </div>
            <ActionTable
              items={items}
              categories={categories}
              onCreatePromo={(product) => setPromoProduct(product)}
              onDelete={deleteItem}
              onDeleteMany={deleteMany}
            />
          </section>
        </main>
      </div>

      {/* Floating Chat Widget */}
      <AgentChatWidget
        promoProduct={promoProduct}
        onPromoClear={() => setPromoProduct(null)}
      />

      {/* Modal Tambah Produk */}
      {showAddModal && (
        <AddProductModal
          onAdd={addItem}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
