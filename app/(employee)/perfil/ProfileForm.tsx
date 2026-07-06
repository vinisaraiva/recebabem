/**
 * Formulário de edição de perfil — client component.
 */
'use client'

import { useState, useTransition } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { updateProfile } from '@/lib/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SECTORS } from '@/lib/constants'

interface Props {
  email:  string
  name:   string
  sector: string
}

export default function ProfileForm({ email, name: initialName, sector: initialSector }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved,     setSaved]        = useState(false)
  const [error,     setError]        = useState<string | null>(null)

  const [name,   setName]   = useState(initialName)
  const [sector, setSector] = useState(initialSector)

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateProfile(name, sector)
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        setError(result.error ?? 'Erro ao salvar.')
      }
    })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="space-y-5">
      {/* Email (read-only) */}
      <div className="card">
        <label className="block text-xs font-medium text-gray-500 mb-1">E-mail</label>
        <p className="text-gray-800 text-sm">{email}</p>
        <p className="text-xs text-gray-400 mt-0.5">O e-mail não pode ser alterado.</p>
      </div>

      {/* Nome */}
      <div className="card space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input text-sm"
            placeholder="Seu nome completo"
            maxLength={80}
          />
        </div>

        {/* Setor */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Setor</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="input text-sm"
          >
            <option value="">Selecionar…</option>
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSave}
          disabled={isPending || !name.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {saved ? '✅ Salvo!' : isPending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      {/* Sair */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </div>
  )
}
