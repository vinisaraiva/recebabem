/**
 * Configurações do hotel — /gerente/configuracoes
 * Gerencia hotel_settings: notificações, setores ativos, mensagem de boas-vindas.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import HotelSettingsForm from '@/components/manager/HotelSettingsForm'

export const metadata = { title: 'Configurações' }

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca hotel_id do usuário logado
  const { data: hotelId } = await supabase.rpc('get_my_hotel_id')

  if (!hotelId) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Hotel não encontrado.</p>
      </div>
    )
  }

  // Busca configurações do hotel
  const { data: settings } = await supabase
    .from('hotel_settings')
    .select('*')
    .eq('hotel_id', hotelId)
    .single()

  const { data: hotel } = await supabase
    .from('hotels')
    .select('name, email, phone, city, state')
    .eq('id', hotelId)
    .single()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Settings size={24} className="text-brand-blue" />
        Configurações
      </h1>

      {/* Info do hotel (read-only, editável só pelo admin) */}
      {hotel && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-700 mb-3 text-sm">Informações do Hotel</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'Nome',      value: hotel.name  },
              { label: 'E-mail',    value: hotel.email  },
              { label: 'Telefone',  value: hotel.phone  },
              { label: 'Cidade',    value: hotel.city   },
              { label: 'Estado',    value: hotel.state  },
            ].map((row) => (
              <div key={row.label}>
                <p className="text-xs text-gray-400">{row.label}</p>
                <p className="text-gray-800">{row.value ?? '—'}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Para alterar estas informações, entre em contato com a RecebaBem.
          </p>
        </div>
      )}

      {/* Formulário de settings editáveis */}
      <HotelSettingsForm settings={settings} />
    </div>
  )
}
