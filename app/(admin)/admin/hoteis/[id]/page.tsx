/**
 * Detalhe do hotel — /admin/hoteis/[id]
 * Info, assinatura, funcionários.
 */
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Users, CreditCard, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import HotelEditForm from '@/components/admin/HotelEditForm'
import SubscriptionActions from '@/components/admin/SubscriptionActions'

export const metadata = { title: 'Detalhe do Hotel' }

const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  trial:     'bg-blue-100 text-blue-700',
  overdue:   'bg-red-100 text-red-600',
  suspended: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const PLAN_LABEL: Record<string, string> = {
  trial:        'Trial',
  essencial:    'Essencial',
  profissional: 'Profissional',
  premium:      'Premium',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function HotelDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Hotel info
  type HotelRow = { id: string; name: string; email: string | null; phone: string | null; city: string | null; state: string | null; slug: string; active: boolean; created_at: string }
  const { data: hotelRaw } = await supabase
    .from('hotels')
    .select('id, name, email, phone, city, state, slug, active, created_at')
    .eq('id', id)
    .single()

  if (!hotelRaw) notFound()
  const hotel = hotelRaw as unknown as HotelRow

  // Assinatura
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, plan_slug, billing_cycle, current_period_start, current_period_end, trial_ends_at')
    .eq('hotel_id', id)
    .single()

  // Funcionários do hotel
  const { data: employees, count: empCount } = await supabase
    .from('profiles')
    .select('id, name, role, sector, active, created_at', { count: 'exact' })
    .eq('hotel_id', id)
    .neq('role', 'super_admin')
    .order('role')
    .order('name')

  // Progresso médio
  const { data: progressData } = await supabase
    .from('track_progress')
    .select('completion_pct, profiles!inner(hotel_id)')
    .eq('profiles.hotel_id', id)

  type ProgressRow = { completion_pct: number }
  const progressRows = (progressData ?? []) as unknown as ProgressRow[]
  const avgProgress = progressRows.length > 0
    ? Math.round(progressRows.reduce((s, p) => s + p.completion_pct, 0) / progressRows.length)
    : 0

  return (
    <div className="p-6 max-w-4xl">
      {/* Voltar */}
      <Link
        href="/admin/hoteis"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={15} />
        Todos os Hotéis
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
          <Building2 size={20} className="text-brand-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
          <p className="text-sm text-gray-400">{hotel.city}, {hotel.state} · slug: {hotel.slug}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{empCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">funcionários</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900">{avgProgress}%</p>
          <p className="text-xs text-gray-400 mt-0.5">progresso médio</p>
        </div>
        <div className="card text-center">
          <p className="text-sm font-bold text-gray-900 mt-1">
            {PLAN_LABEL[subscription?.plan_slug ?? ''] ?? subscription?.plan_slug ?? '—'}
          </p>
          {subscription?.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[subscription.status] ?? ''}`}>
              {subscription.status}
            </span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Editar informações */}
        <section className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-brand-blue" />
            Informações
          </h2>
          <HotelEditForm hotel={hotel} />
        </section>

        {/* Assinatura */}
        <section className="card">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-brand-blue" />
            Assinatura
          </h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Plano</span>
              <span className="font-medium">{PLAN_LABEL[subscription?.plan_slug ?? ''] ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              {subscription?.status ? (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[subscription.status]}`}>
                  {subscription.status}
                </span>
              ) : '—'}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ciclo</span>
              <span className="font-medium">{subscription?.billing_cycle ?? '—'}</span>
            </div>
            {subscription?.trial_ends_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Trial até</span>
                <span className="font-medium">{formatDate(subscription.trial_ends_at)}</span>
              </div>
            )}
            {subscription?.current_period_end && (
              <div className="flex justify-between">
                <span className="text-gray-500">Período até</span>
                <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
              </div>
            )}
          </div>

          {/* Ações de assinatura */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
              <AlertTriangle size={12} />
              Zona de Atenção
            </p>
            <SubscriptionActions
              hotelId={hotel.id}
              currentStatus={subscription?.status ?? 'trial'}
            />
          </div>
        </section>
      </div>

      {/* Funcionários */}
      <section className="mt-6 card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users size={16} className="text-brand-blue" />
          Equipe ({empCount ?? 0})
        </h2>
        <div className="space-y-2">
          {(employees ?? []).map((emp) => (
            <div key={emp.id} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-blue text-xs font-bold">
                  {emp.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                <p className="text-xs text-gray-400 capitalize">{emp.role} · {emp.sector ?? 'geral'}</p>
              </div>
              {!emp.active && (
                <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">inativo</span>
              )}
              <p className="text-xs text-gray-400 hidden md:block">{formatDate(emp.created_at)}</p>
            </div>
          ))}
          {(employees ?? []).length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhum funcionário cadastrado.</p>
          )}
        </div>
      </section>
    </div>
  )
}
