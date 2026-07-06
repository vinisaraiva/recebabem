/**
 * Botão + modal para convidar funcionário.
 * Server Action cria a invitation e retorna o link de convite.
 */
'use client'

import { useState } from 'react'
import { UserPlus, X, Loader2, Copy, Check } from 'lucide-react'
import { createInvitation } from '@/lib/actions/invitations'
import { SECTORS } from '@/lib/constants'

export default function InviteButton() {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [link,    setLink]    = useState<string | null>(null)
  const [copied,  setCopied]  = useState(false)
  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [sector,  setSector]  = useState('geral')
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createInvitation({ email, name, sector })

    if (result.success && result.link) {
      setLink(result.link)
    } else {
      setError(result.error ?? 'Erro ao criar convite.')
    }
    setLoading(false)
  }

  async function copyLink() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClose() {
    setOpen(false)
    setLink(null)
    setEmail('')
    setName('')
    setSector('geral')
    setError(null)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <UserPlus size={16} /> Convidar
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-bold text-gray-900">Convidar Funcionário</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {!link ? (
              <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="funcionario@hotel.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                    placeholder="Nome completo (opcional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="input"
                  >
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Gerando convite…' : 'Gerar link de convite'}
                </button>
              </form>
            ) : (
              <div className="px-5 pb-5 space-y-4">
                <p className="text-sm text-gray-600">
                  Link gerado! Compartilhe com o funcionário:
                </p>
                <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-600 break-all font-mono">
                  {link}
                </div>
                <button
                  onClick={copyLink}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar link'}
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-gray-400 text-sm hover:text-gray-600"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
