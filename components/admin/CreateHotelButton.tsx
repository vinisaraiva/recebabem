/**
 * Botão + modal para criar hotel diretamente (super_admin).
 * Chama o RPC admin_create_hotel que cria hotel + settings + assinatura trial.
 */
'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createHotel } from '@/lib/actions/admin-hotels'

export default function CreateHotelButton() {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    name:    '',
    email:   '',
    phone:   '',
    city:    'Porto Seguro',
    state:   'BA',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createHotel(form)

    if (result.success) {
      setSuccess(true)
      setTimeout(() => { setOpen(false); setSuccess(false); setForm({ name: '', email: '', phone: '', city: 'Porto Seguro', state: 'BA' }) }, 1500)
    } else {
      setError(result.error ?? 'Erro ao criar hotel.')
    }
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <Plus size={16} /> Novo Hotel
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-bold text-gray-900">Cadastrar Hotel</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {success ? (
              <div className="px-5 pb-5 text-center py-8">
                <p className="text-4xl mb-2">🏨</p>
                <p className="font-semibold text-brand-green">Hotel criado com sucesso!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-3">
                {[
                  { name: 'name',  label: 'Nome do hotel *',   placeholder: 'Hotel Exemplo', required: true  },
                  { name: 'email', label: 'E-mail de contato', placeholder: 'hotel@email.com', required: false },
                  { name: 'phone', label: 'Telefone',          placeholder: '(73) 99999-9999',  required: false },
                  { name: 'city',  label: 'Cidade',            placeholder: 'Porto Seguro',     required: false },
                  { name: 'state', label: 'Estado',            placeholder: 'BA',               required: false },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      required={field.required}
                      value={(form as Record<string, string>)[field.name]}
                      onChange={handleChange}
                      className="input"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Criando…' : 'Criar Hotel'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
