// ─────────────────────────────────────────────────────────────
// Konfigurasi LangFlow & Gemini API
// Nilai diambil dari .env (lihat .env.example untuk panduan setup)
// ─────────────────────────────────────────────────────────────

// LangFlow Desktop config
export const LANGFLOW_BASE_URL = import.meta.env.VITE_LANGFLOW_BASE_URL ?? '/langflow-api'
export const LANGFLOW_FLOW_ID  = import.meta.env.VITE_LANGFLOW_FLOW_ID  ?? 'ecbe443a-cafc-4991-a25e-1fdee7d85b75'
export const LANGFLOW_API_KEY  = import.meta.env.VITE_LANGFLOW_API_KEY  ?? ''

// Google Gemini Direct API (fallback jika LangFlow gagal)
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''
export const GEMINI_MODELS  = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

export const SYSTEM_PROMPT = `Kamu adalah Asisten Utama Toko UMKM "Smart Retail AI". 
Tugasmu membantu pemilik toko menganalisis inventaris, mengidentifikasi produk yang perlu dipromosikan, dan membuat teks promosi WhatsApp yang menarik dan siap kirim.
Selalu jawab dalam Bahasa Indonesia yang ramah dan profesional.`
