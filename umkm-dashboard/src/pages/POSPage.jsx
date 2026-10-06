import { useState, useRef } from 'react'
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  Mail,
  CheckCircle2,
  X,
  ScanBarcode,
  Tag,
  PackageX,
} from 'lucide-react'

/* ─── helpers ─────────────────────────────────────── */
function fmtRp(n) {
  if (!n && n !== 0) return 'Rp 0'
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

function nowStr() {
  const d = new Date()
  return {
    date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    txId: 'TXN' + d.getTime().toString().slice(-8),
  }
}

const PAYMENT_METHODS = [
  { id: 'cash',    label: 'Tunai',    Icon: Banknote },
  { id: 'card',    label: 'Kartu',    Icon: CreditCard },
  { id: 'ewallet', label: 'E-Wallet', Icon: Smartphone },
]

const QUICK_CASH = [5_000, 10_000, 20_000, 50_000, 100_000, 200_000]

/* ─── ReceiptModal ─────────────────────────────────── */
function ReceiptModal({ lines, txId, onClose }) {
  function handlePrint() {
    const w = window.open('', '_blank', 'width=420,height=640')
    if (!w) return
    w.document.write(
      `<!DOCTYPE html><html><head><title>Struk ${txId}</title></head>` +
      `<body><pre style="font-family:monospace;font-size:13px;line-height:1.6;padding:20px">${
        lines.join('\n')
      }</pre></body></html>`
    )
    w.document.close()
    w.focus()
    w.print()
  }

  function handleEmail() {
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href =
      `mailto:?subject=Struk Belanja Smart Retail – ${txId}&body=${body}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">

        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <span className="font-bold text-gray-800 text-sm">Transaksi Berhasil!</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* struk */}
        <div className="px-5 py-4 max-h-72 overflow-y-auto bg-gray-50">
          <pre className="text-xs font-mono text-gray-700 whitespace-pre leading-relaxed">
            {lines.join('\n')}
          </pre>
        </div>

        {/* aksi */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5
                       bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                       rounded-xl transition-colors"
          >
            <Printer size={15} />
            Cetak Struk
          </button>
          <button
            onClick={handleEmail}
            className="flex-1 flex items-center justify-center gap-2 py-2.5
                       bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold
                       rounded-xl transition-colors"
          >
            <Mail size={15} />
            E-Receipt
          </button>
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600
                       hover:bg-gray-50 rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── ProductCard ──────────────────────────────────── */
function ProductCard({ item, inCart, onAdd }) {
  const outOfStock = item.stok <= 0
  const lowStock   = item.stok > 0 && item.stok <= item.stokMin

  return (
    <button
      onClick={() => !outOfStock && onAdd(item)}
      disabled={outOfStock}
      className={[
        'relative flex flex-col items-start p-3 rounded-xl border text-left transition-all',
        outOfStock
          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
          : inCart
          ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100 hover:border-blue-500'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm',
      ].join(' ')}
    >
      {/* badge qty in cart */}
      {inCart && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600
                         text-white text-xs font-bold flex items-center justify-center">
          {inCart.qty}
        </span>
      )}

      {/* thumbnail */}
      <div className="w-full aspect-square bg-gray-100 rounded-lg mb-2
                      flex items-center justify-center overflow-hidden">
        {outOfStock
          ? <PackageX size={22} className="text-gray-300" />
          : <ShoppingCart size={22} className="text-gray-300" />
        }
      </div>

      {/* info */}
      <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1 w-full">
        {item.nama}
      </p>
      <p className="text-xs font-bold text-blue-600 mb-0.5">{fmtRp(item.hargaJual)}</p>
      <span className={[
        'inline-flex items-center gap-1 text-xs rounded-full px-1.5 py-0.5 font-medium',
        outOfStock ? 'bg-red-100 text-red-600'
          : lowStock ? 'bg-amber-100 text-amber-600'
          : 'bg-gray-100 text-gray-500',
      ].join(' ')}>
        {outOfStock ? 'Habis' : `Stok: ${item.stok}`}
      </span>
    </button>
  )
}

/* ─── POSPage (main) ───────────────────────────────── */
export default function POSPage({ items, onReduceStock, onCheckoutLog, cashierName }) {
  const [search,        setSearch]        = useState('')
  const [barcode,       setBarcode]       = useState('')
  const [activeCat,     setActiveCat]     = useState('Semua')
  const [cart,          setCart]          = useState([])
  const [payMethod,     setPayMethod]     = useState('cash')
  const [cashInput,     setCashInput]     = useState('')
  const [receiptData,   setReceiptData]   = useState(null)
  const [barcodeErr,    setBarcodeErr]    = useState(false)

  const barcodeRef = useRef(null)

  /* ── derived ── */
  const categories = ['Semua', ...new Set(items.map(i => i.kategori))]

  const filtered = items.filter(item => {
    const matchCat = activeCat === 'Semua' || item.kategori === activeCat
    const q = search.trim().toLowerCase()
    const matchQ  = !q
      || item.nama.toLowerCase().includes(q)
      || String(item.id).includes(q)
    return matchCat && matchQ
  })

  const subtotal  = cart.reduce((s, c) => s + c.hargaJual * c.qty, 0)
  const cashPaid  = parseInt(cashInput.replace(/\D/g, '') || '0', 10)
  const change    = payMethod === 'cash' ? Math.max(0, cashPaid - subtotal) : 0
  const canPay    = cart.length > 0 && (payMethod !== 'cash' || cashPaid >= subtotal)

  /* ── cart ops ── */
  function addToCart(item) {
    if (item.stok <= 0) return
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) {
        if (ex.qty >= item.stok) return prev
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function changeQty(id, delta) {
    setCart(prev =>
      prev
        .map(c => c.id === id ? { ...c, qty: c.qty + delta } : c)
        .filter(c => c.qty > 0)
    )
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  function clearCart() {
    setCart([])
    setCashInput('')
  }

  /* ── barcode ── */
  function handleBarcode(e) {
    e.preventDefault()
    const code = barcode.trim()
    if (!code) return
    const found = items.find(i => String(i.id) === code || i.barcode === code)
    if (found) {
      addToCart(found)
      setBarcodeErr(false)
    } else {
      setBarcodeErr(true)
      setTimeout(() => setBarcodeErr(false), 1500)
    }
    setBarcode('')
    barcodeRef.current?.focus()
  }

  /* ── checkout ── */
  function handleCheckout() {
    if (!canPay) return

    // snapshot cart before clearing
    const snapshot = [...cart]

    // reduce stock
    snapshot.forEach(c => onReduceStock(c.id, c.qty))

    // build receipt lines
    const { date, time, txId } = nowStr()
    const sep32 = '================================'
    const sep32d = '--------------------------------'
    const lines = [
      sep32,
      '      SMART RETAIL AI POS       ',
      '   Jl. Contoh No. 1, Jakarta    ',
      sep32,
      `Tanggal : ${date}`,
      `Jam     : ${time}`,
      `No. Tx  : ${txId}`,
      `Kasir   : ${cashierName}`,
      sep32d,
      ...snapshot.map(c => {
        const nama  = c.nama.length > 18 ? c.nama.slice(0, 17) + '…' : c.nama
        const total = fmtRp(c.hargaJual * c.qty)
        return `${nama}\n  ${fmtRp(c.hargaJual)} x${c.qty}  = ${total}`
      }),
      sep32d,
      `TOTAL      : ${fmtRp(subtotal)}`,
      `Pembayaran : ${PAYMENT_METHODS.find(p => p.id === payMethod)?.label ?? payMethod}`,
      ...(payMethod === 'cash'
        ? [`Bayar      : ${fmtRp(cashPaid)}`, `Kembalian  : ${fmtRp(change)}`]
        : []),
      sep32d,
      '  Terima kasih telah berbelanja! ',
      sep32,
    ]

    setReceiptData({ lines, txId })
    // Fire checkout log with snapshot + payment info
    onCheckoutLog?.(snapshot, PAYMENT_METHODS.find(p => p.id === payMethod)?.label ?? payMethod, subtotal)
    clearCart()
    setPayMethod('cash')
  }

  /* ── render ── */
  return (
    <>
      {/* two-column POS layout */}
      <div className="flex gap-4" style={{ height: 'calc(100vh - 112px)' }}>

        {/* ══ LEFT: catalog ═══════════════════════════════════ */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* search + barcode row */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {/* search */}
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama produk atau ID…"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl
                           text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* barcode */}
            <form onSubmit={handleBarcode} className="flex gap-2 shrink-0">
              <div className="relative">
                <ScanBarcode
                  size={14}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none
                              ${barcodeErr ? 'text-red-400' : 'text-gray-400'}`}
                />
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcode}
                  onChange={e => { setBarcode(e.target.value); setBarcodeErr(false) }}
                  placeholder="Scan barcode…"
                  className={`w-36 pl-9 pr-3 py-2.5 border rounded-xl text-sm
                              focus:outline-none focus:ring-2 focus:ring-blue-400
                              ${barcodeErr
                                ? 'border-red-400 bg-red-50 text-red-700'
                                : 'border-gray-200 bg-white'}`}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white
                           rounded-xl text-sm font-semibold transition-colors"
              >
                Tambah
              </button>
            </form>
          </div>

          {/* category pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-semibold transition-colors border',
                  activeCat === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                ].join(' ')}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* product grid — scrollable */}
          <div className="flex-1 overflow-y-auto -mx-1 px-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300 gap-2">
                <Tag size={32} />
                <p className="text-sm">Produk tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-4">
                {filtered.map(item => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    inCart={cart.find(c => c.id === item.id)}
                    onAdd={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT: cart + payment ════════════════════════════ */}
        <div className="w-80 shrink-0 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden">

          {/* cart header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} className="text-blue-600" />
              <span className="text-sm font-bold text-gray-800">Keranjang</span>
              {cart.length > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold
                                 px-1.5 py-0.5 rounded-full leading-none">
                  {cart.reduce((s, c) => s + c.qty, 0)}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600
                           font-medium transition-colors"
              >
                <Trash2 size={12} /> Kosongkan
              </button>
            )}
          </div>

          {/* cart items — scrollable */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full
                              text-gray-200 gap-2 py-12">
                <ShoppingCart size={36} />
                <p className="text-sm text-gray-300">Keranjang kosong</p>
                <p className="text-xs text-gray-300 text-center px-4">
                  Klik produk di kiri untuk menambahkan
                </p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id}
                     className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate leading-tight">
                      {item.nama}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      {fmtRp(item.hargaJual)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300
                                 flex items-center justify-center transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      disabled={item.qty >= item.stok}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300
                                 flex items-center justify-center transition-colors
                                 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200
                                 text-red-400 hover:text-red-600 flex items-center
                                 justify-center transition-colors ml-0.5"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* payment panel */}
          <div className="border-t border-gray-100 px-4 py-4 space-y-3">

            {/* subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Subtotal</span>
              <span className="text-lg font-bold text-gray-800">{fmtRp(subtotal)}</span>
            </div>

            {/* payment method */}
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setPayMethod(id)}
                  className={[
                    'flex flex-col items-center py-2 rounded-xl border text-xs font-semibold transition-colors',
                    payMethod === id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
                  ].join(' ')}
                >
                  <Icon size={15} className="mb-1" />
                  {label}
                </button>
              ))}
            </div>

            {/* cash input */}
            {payMethod === 'cash' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">Jumlah Dibayar</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cashInput ? Number(cashInput).toLocaleString('id-ID') : ''}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '')
                    setCashInput(raw)
                  }}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm
                             font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {/* change display */}
                {cashPaid > 0 && (
                  <div className={[
                    'flex justify-between text-xs px-1 font-semibold',
                    change >= 0 ? 'text-emerald-600' : 'text-red-500',
                  ].join(' ')}>
                    <span>Kembalian</span>
                    <span>{fmtRp(change)}</span>
                  </div>
                )}

                {/* quick cash buttons */}
                <div className="flex gap-1 flex-wrap">
                  {QUICK_CASH
                    .filter(v => v >= subtotal * 0.9 || subtotal === 0)
                    .slice(0, 5)
                    .map(v => (
                      <button
                        key={v}
                        onClick={() => setCashInput(String(v))}
                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200
                                   text-gray-600 rounded-lg font-medium transition-colors"
                      >
                        {v >= 1000 ? `${v / 1000}rb` : v}
                      </button>
                    ))
                  }
                  {subtotal > 0 && (
                    <button
                      onClick={() => setCashInput(String(subtotal))}
                      className="text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100
                                 text-emerald-700 rounded-lg font-medium transition-colors"
                    >
                      Uang Pas
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* checkout button */}
            <button
              onClick={handleCheckout}
              disabled={!canPay}
              className={[
                'w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors',
                canPay
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              ].join(' ')}
            >
              <CreditCard size={16} />
              Proses Pembayaran
            </button>
          </div>
        </div>
      </div>

      {/* receipt modal */}
      {receiptData && (
        <ReceiptModal
          lines={receiptData.lines}
          txId={receiptData.txId}
          onClose={() => setReceiptData(null)}
        />
      )}
    </>
  )
}
