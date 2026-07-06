/**
 * Formulário de edição de hotel — super_admin.
 * Campos: nome, email, telefone, cidade, estado.
 */
'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateHotel } from '@/lib/actions/admin-hotels'

interface Props {
  hotel: {
    id:     string
    name:   string
    email:  string | null
    phone:  string | null
    city:   string | null
    state:  string | null
  }
}

export default function HotelEditForm({ hotel }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved,     setSaved]        = useState(false)
  const [error,     setError]        = useState<string | null>(null)

  const [name,  setName]  = useState(hotel.name)
  const [email, setEmail] = useState(hotel.email  ?? '')
  const [phone, setPhone] = useState(hotel.phone  ?? '')
  const [city,  setCity]  = useState(hotel.city   ?? '')
  const [state, setState] = useState(hotel.state  ?? '')

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateHotel({ hotelId: hotel.id, name, email, phone, city, state })
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        setError(result.error ?? 'Erro ao salvar.')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nome do Hotel *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input text-sm"
            placeholder="Hotel Porto Seguro"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input text-sm"
            placeholder="contato@hotel.com.br"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Telefone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input text-sm"
            placeholder="(73) 9 9999-9999"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Cidade</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input text-sm"
            placeholder="Porto Seguro"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="input text-sm"
            maxLength={2}
            placeholder="BA"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={isPending || !name.trim()}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        {saved ? '✅ Salvo!' : isPending ? 'Salvando…' : 'Salvar Alterações'}
      </button>
    </div>
  )
}
