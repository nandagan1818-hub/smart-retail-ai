import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import {
  LANGFLOW_BASE_URL, LANGFLOW_FLOW_ID, LANGFLOW_API_KEY,
  GEMINI_API_KEY, GEMINI_MODELS, SYSTEM_PROMPT
} from '../config/langflow'
import { MessageCircle, X, Send, Bot, User, Loader2, Copy, Check, Zap } from 'lucide-react'

// ── Panggil LangFlow ──────────────────────────────────────────
async function callLangflow(text) {
  const url = `${LANGFLOW_BASE_URL}/api/v1/run/${LANGFLOW_FLOW_ID}?stream=false`
  const res = await axios.post(
    url,
    { input_value: text, output_type: 'chat', input_type: 'chat' },
    {
      headers: { 'x-api-key': LANGFLOW_API_KEY, 'Content-Type': 'application/json' },
      timeout: 60000,
    }
  )
  // Jika response body mengandung 'detail' (error dari LangFlow), throw agar fallback
  if (res.data?.detail) throw new Error(`LangFlow error: ${res.data.detail}`)
  const out = res.data?.outputs?.[0]?.outputs?.[0]
  const txt = out?.results?.message?.text ?? out?.messages?.[0]?.message ?? ''
  if (!txt) throw new Error('empty_response')
  return txt
}

// ── Panggil Gemini langsung (fallback) ───────────────────────
async function callGeminiDirect(text) {
  let lastErr
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
      const res = await axios.post(url, {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }, { timeout: 30000 })
      const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (reply) return { text: reply, model }
    } catch (err) {
      lastErr = err
      // 429 atau 503 → coba model berikutnya
      const status = err?.response?.status
      if (status !== 429 && status !== 503 && status !== 404) throw err
    }
  }
  throw lastErr
}

// ── Fungsi utama: coba LangFlow, fallback ke Gemini ──────────
async function sendToAI(text) {
  try {
    const txt = await callLangflow(text)
    return { text: txt, via: 'LangFlow' }
  } catch (lfErr) {
    console.warn('[LangFlow gagal, coba Gemini]', lfErr?.message)
    try {
      const { text: reply, model } = await callGeminiDirect(text)
      return { text: reply, via: `Gemini (${model})` }
    } catch (gemErr) {
      // Kedua jalur gagal — lempar error Gemini (lebih informatif)
      throw gemErr
    }
  }
}

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`p-1.5 rounded-full flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-gray-200'}`}>
        {isUser
          ? <User size={14} className="text-white" />
          : <Bot size={14} className="text-gray-600" />
        }
      </div>
      <div className="max-w-[75%] group relative">
        <div
          className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed
            ${isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}
        >
          {msg.content}
        </div>
        {!isUser && msg.via && (
          <div className="flex items-center gap-1 mt-1">
            <Zap size={9} className="text-emerald-500" />
            <span className="text-xs text-gray-400">{msg.via}</span>
          </div>
        )}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
            title="Copy teks"
          >
            {copied
              ? <Check size={11} className="text-emerald-500" />
              : <Copy size={11} className="text-gray-400" />
            }
          </button>
        )}
      </div>
    </div>
  )
}

export default function AgentChatWidget({ promoProduct, onPromoClear }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    { id: 0, role: 'ai', content: 'Halo! Saya Asisten Smart Retail AI. Klik "Buat Promo" di tabel produk, atau tanyakan sesuatu tentang inventaris toko Anda.' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  // Auto-scroll ke bawah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Trigger otomatis dari tombol Buat Promo
  useEffect(() => {
    if (!promoProduct) return

    const product = promoProduct   // capture sebelum di-clear
    onPromoClear()                 // clear segera agar tidak double-trigger
    setOpen(true)

    const status = product.expired
      ? new Date(product.expired) <= new Date('2026-10-31') ? 'EXPIRED bulan ini' : 'Hampir Expired'
      : product.stok / product.terjualPerBulan > 3 ? 'Dead-Stock (menumpuk)' : 'Normal'

    const prompt =
      `Kamu adalah Asisten Utama Toko UMKM "Smart Retail AI".\n\n` +
      `Seorang pemilik toko meminta analisis dan strategi promo untuk produk berikut:\n\n` +
      `- Nama Produk  : ${product.nama}\n` +
      `- Kategori     : ${product.kategori}\n` +
      `- Stok Saat Ini: ${product.stok} pcs\n` +
      `- Terjual/Bulan: ${product.terjualPerBulan} pcs\n` +
      `- Harga Jual   : Rp${product.hargaJual.toLocaleString('id-ID')}\n` +
      `- Tgl Expired  : ${product.expired ?? 'tidak ada'}\n` +
      `- Status       : ${status}\n\n` +
      `Tolong lakukan:\n` +
      `1. Analisis singkat mengapa produk ini perlu dipromosikan\n` +
      `2. Skema promo "Buy 1 Get 1" yang spesifik (mekanisme, harga, durasi, batas pembelian)\n` +
      `3. Teks promosi WhatsApp Broadcast yang siap kirim (gunakan emoji, buat menarik)\n` +
      `4. Satu rekomendasi tambahan jika BOGO tidak cukup`

    sendMessage(prompt, product.nama)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoProduct])

  async function sendMessage(text, autoLabel = false) {
    const content = autoLabel ? `📦 Buat promo untuk: ${autoLabel}` : text
    if (!text.trim()) return

    const userMsg = { id: Date.now(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { text: reply, via } = await sendToAI(text)
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai', content: reply, via
      }])
    } catch (err) {
      const status = err?.response?.status
      const geminiErrBody = err?.response?.data?.error?.message ?? ''
      const errMsg = status === 429
        ? '⚠️ Kuota API Gemini habis hari ini.\n\nSolusi: Buka https://aistudio.google.com/app/apikey → buat project baru → copy API Key baru → update GEMINI_API_KEY di src/config/langflow.js'
        : status === 400
        ? `❌ API Key Gemini tidak valid.\n\nSilakan update GEMINI_API_KEY di src/config/langflow.js\n\nDetail: ${geminiErrBody}`
        : status === 403
        ? '❌ API Key tidak punya akses. Pastikan Gemini API sudah diaktifkan di Google Cloud Console.'
        : err?.code === 'ECONNABORTED' || err?.code === 'ERR_NETWORK'
        ? '⏱️ Koneksi timeout atau LangFlow tidak berjalan.\n\nPastikan LangFlow Desktop aktif di port 7860, lalu coba lagi.'
        : `❌ Gagal menghubungi AI.\n\nPastikan:\n1. LangFlow Desktop berjalan di port 7860\n2. GEMINI_API_KEY masih valid\n\nError: ${err?.message ?? ''}`
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all"
        aria-label="Buka Chat AI"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh' }}>
          {/* Panel header */}
          <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
            <div className="bg-blue-500 p-1.5 rounded-full">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Smart Retail AI</p>
              <p className="text-blue-200 text-xs">Asisten Inventaris UMKM</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(msg => <ChatBubble key={msg.id} msg={msg} />)}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-gray-200 p-1.5 rounded-full flex-shrink-0">
                  <Bot size={14} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Loader2 size={13} className="animate-spin" />
                    <span className="text-xs">AI sedang memproses... (maks 2 menit)</span>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <textarea
              rows={1}
              placeholder="Tulis pesan..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 resize-none text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl px-3 transition-colors"
              aria-label="Kirim"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
