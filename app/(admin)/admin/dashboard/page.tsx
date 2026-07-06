/**
 * Dashboard super_admin — /admin/dashboard
 * Visão geral SaaS: hotéis ativos, MRR, certificados pendentes, funcionários.
 */
import { createClient } from '@/lib/supabase/server'
import { formatCurrencyFloat } from '@/lib/utils/format'
import { Building2, DollarSign, Award, Users, Clock } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Dashboard Admin' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Métricas SaaS da view admin_saas_metrics
  const { data: metrics } = await supabase
    .from('admin_saas_metrics')
    .select('*')
    .single()

  // Hotéis — overview
  const { data: hotels, count: totalHotels } = await supabase
    .from('admin_hotels_overview')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5)

  // Certificados pendentes
  const { data: pendingCerts, count: pendingCount } = await supabase
    .from('certificate_queue')
    .select('*', { count: 'exact' })

  const mrr = (metrics as Record<string, unknown>)?.mrr as number ?? 0
  const arr = (metrics as Record<string, unknown>)?.arr as number ?? 0

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 text-brand-blue mb-2">
            <Building2 size={18} />
            <span className="text-xs font-medium uppercase">Hotéis</span>
          </div>
          <p className="text-3xl font-bold">{totalHotels ?? 0}</p>
          <p className="text-xs text-gray-400">ativos</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-brand-green mb-2">
            <DollarSign size={18} />
            <span className="text-xs font-medium uppercase">MRR</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrencyFloat(mrr)}</p>
          <p className="text-xs text-gray-400">ARR: {formatCurrencyFloat(arr)}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Award size={18} />
            <span className="text-xs font-medium uppercase">Certificados</span>
          </div>
          <p className="text-3xl font-bold">{pendingCount ?? 0}</p>
          <p className="text-xs text-yellow-500 font-medium">aguardando emissão</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <Users size={18} />
            <span className="text-xs font-medium uppercase">Funcionários</span>
          </div>
          <p className="text-3xl font-bold">
            {(metrics as Record<string, unknown>)?.total_active_employees as number ?? 0}
          </p>
          <p className="text-xs text-gray-400">total na plataforma</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Hotéis recentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Hotéis Recentes</h2>
            <Link href="/admin/hoteis" className="text-brand-blue text-sm">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {(hotels ?? []).map((hotel: Record<string, unknown>) => (
              <div key={hotel.id as string} className="card flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={16} className="text-brand-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{hotel.name as string}</p>
                  <p className="text-xs text-gray-400">
                    {hotel.employee_count as number ?? 0} funcionários · {hotel.plan as string}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  hotel.subscription_status === 'active'  ? 'bg-green-100 text-green-700' :
                  hotel.subscription_status === 'trial'   ? 'bg-blue-100 text-blue-700' :
                  hotel.subscription_status === 'overdue' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {hotel.subscription_status as string}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fila de certificados */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Fila de Certificados</h2>
            <Link href="/admin/certificados" className="text-brand-blue text-sm">
              Gerenciar →
            </Link>
          </div>

          {(pendingCount ?? 0) === 0 ? (
            <div className="card text-center py-8 text-gray-400 text-sm">
              ✅ Nenhum certificado pendente
            </div>
          ) : (
            <div className="space-y-2">
              {(pendingCerts ?? []).slice(0, 5).map((cert: Record<string, unknown>) => (
                <div key={cert.id as string} className="card flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock size={14} className="text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {cert.employee_name as string}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {cert.hotel_name as string} · {cert.track_name as string}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
