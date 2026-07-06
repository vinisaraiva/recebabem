/**
 * Formulário de configurações do hotel — gerente pode editar.
 * Salva via Server Action.
 */
'use client'

import { useState, useTransition } from 'react'
import { Bell, Eye, MessageSquare, Loader2 } from 'lucide-react'
import { saveHotelSettings } from '@/lib/actions/hotel-settings'
import { SECTORS } from '@/lib/constants'

interface Settings {
  welcome_message?:    string | null
  notifications_enabled: boolean
  notification_hour?:  number | null
  notification_minute?: number | null
  ranking_visible?:    boolean | null
  active_sectors?:     string[] | null
}

interface Props {
  settings: Settings | null
}

export default function HotelSettingsForm({ settings }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved,     setSaved]        = useState(false)

  const [welcomeMsg,    setWelcomeMsg]    = useState(settings?.welcome_message ?? '')
  const [notifEnabled,  setNotifEnabled]  = useState(settings?.notifications_enabled ?? true)
  const [notifHour,     setNotifHour]     = useState(settings?.notification_hour ?? 9)
  const [notifMinute,   setNotifMinute]   = useState(settings?.notification_minute ?? 0)
  const [rankingVisible,setRankingVisible]= useState(settings?.ranking_visible ?? true)
  const [activeSectors, setActiveSectors] = useState<string[]>(settings?.active_sectors ?? SECTORS.map(s => s.value))

  function toggleSector(value: string) {
    setActiveSectors((prev) =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]
    )
  }

  function handleSave() {
    startTransition(async () => {
      await saveHotelSettings({
        // hotelId removido — agora buscado no servidor via get_my_hotel_id()
        welcomeMessage:      welcomeMsg,
        notificationsEnabled: notifEnabled,
        notificationHour:    notifHour,
        notificationMinute:  notifMinute,
        rankingVisible,
        activeSectors,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    })
  }

  return (
    <div className="space-y-5">
      {/* Mensagem de boas-vindas */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-brand-blue" />
          <h3 className="font-semibold text-gray-800 text-sm">Mensagem de Boas-vindas</h3>
        </div>
        <textarea
          value={welcomeMsg}
          onChange={(e) => setWelcomeMsg(e.target.value)}
          className="input resize-none text-sm"
          rows={3}
          placeholder="Bem-vindo(a) à equipe do Hotel! Aqui você encontra treinamentos de inglês para melhorar seu atendimento."
          maxLength={300}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{welcomeMsg.length}/300</p>
      </div>

      {/* Notificações */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-brand-blue" />
            <h3 className="font-semibold text-gray-800 text-sm">Notificações de Lembrete</h3>
          </div>
          <button
            type="button"
            onClick={() => setNotifEnabled(v => !v)}
            className={`w-10 h-5 rounded-full transition-colors ${notifEnabled ? 'bg-brand-green' : 'bg-gray-200'}`}
          >
            <span className={`block w-4 h-4 m-0.5 rounded-full bg-white shadow transition-transform ${notifEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {notifEnabled && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">Enviar às</span>
            <select
              value={notifHour}
              onChange={(e) => setNotifHour(Number(e.target.value))}
              className="input w-20 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-gray-600">h</span>
            <select
              value={notifMinute}
              onChange={(e) => setNotifMinute(Number(e.target.value))}
              className="input w-20 text-sm"
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-gray-500 text-xs">(horário do hotel)</span>
          </div>
        )}
      </div>

      {/* Ranking visível para funcionários */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-brand-blue" />
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Ranking Visível</h3>
              <p className="text-xs text-gray-400">Funcionários podem ver o ranking do hotel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRankingVisible(v => !v)}
            className={`w-10 h-5 rounded-full transition-colors ${rankingVisible ? 'bg-brand-green' : 'bg-gray-200'}`}
          >
            <span className={`block w-4 h-4 m-0.5 rounded-full bg-white shadow transition-transform ${rankingVisible ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Setores ativos */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">Setores Ativos no Hotel</h3>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((sector) => {
            const active = activeSectors.includes(sector.value)
            return (
              <button
                key={sector.value}
                type="button"
                onClick={() => toggleSector(sector.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-all ${
                  active
                    ? 'bg-brand-blue border-brand-blue text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {sector.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Salvar */}
      <button
        onClick={handleSave}
        disabled={isPending}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {saved ? '✅ Salvo!' : isPending ? 'Salvando…' : 'Salvar Configurações'}
      </button>
    </div>
  )
}
