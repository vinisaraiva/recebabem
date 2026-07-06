/**
 * Botão para emitir certificado + modal para colar a URL do PDF.
 */
'use client'

import { useState } from 'react'
import { Award, X, Loader2 } from 'lucide-react'
import { issueCertificate } from '@/lib/actions/admin-certificates'

interface Props {
  certificateId: string
  employeeName:  string
  trackName:     string
}

export default function IssueCertificateButton({ certificateId, employeeName, trackName }: Props) {
  const [open,     setOpen]     = useState(false)
  const [url,      setUrl]      = useState('')
  const [notes,    setNotes]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError(null)

    const result = await issueCertificate({ certificateId, certificateUrl: url, notes })

    if (result.success) {
      setDone(true)
      setTimeout(() => { setOpen(false); setDone(false) }, 1500)
    } else {
      setError(result.error ?? 'Erro ao emitir.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <span className="text-brand-green text-sm font-semibold">✅ Emitido!</span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white
                   text-sm font-semibold hover:bg-brand-green-dark transition-colors flex-shrink-0"
      >
        <Award size={15} /> Emitir
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-bold text-gray-900">Emitir Certificado</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleIssue} className="px-5 pb-5 space-y-4">
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
                <p><strong>{employeeName}</strong></p>
                <p className="text-gray-400">{trackName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do certificado (PDF/imagem) *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input"
                  placeholder="https://storage.supabase.co/..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Cole o link do certificado gerado (Supabase Storage ou outro serviço)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input resize-none"
                  rows={2}
                  placeholder="Notas internas..."
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="btn-secondary flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Emitindo…' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
