/**
 * Painel do gerente — /gerente/painel
 * Visão geral: funcionários ativos, progresso médio, certificados confirmados.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, TrendingUp, Award, AlertCircle } from 'lucide-react'
import { formatPercent } from '@/lib/utils/format'
import Link from 'next/link'

export const metadata = { title: 'Painel do Gerente' }

export default async function PainelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verifica role — apenas manager/hotel_admin/super_admin
  const { data: role } = await supabase.rpc('get_my_role')
  if (!['manager', 'hotel_admin', 'super_admin'].includes(role ?? '')) {
    redirect('/inicio')
  }

  // Funcionários do hotel
  const { data: employees, count: totalEmployees } = await supabase
    .from('profiles')
    .select('id, name, sector, active', { count: 'exact' })
    .eq('role', 'employee')
    .eq('active', true)
    .order('name')

  // Certificados emitidos (view retorna apenas status='issued' para managers)
  const { data: certs, count: certCount } = await supabase
    .from('hotel_certificate_confirmations')
    .select('*', { count: 'exact' })

  // Progresso médio de todos os track_progress do hotel
  const { data: progressData } = await supabase
    .from('track_progress')
    .select('completion_pct, profiles!inner(hotel_id, role)')
    .eq('profiles.role', 'employee')

  type ProgressRow = { completion_pct: number }
  const progressRows = (progressData ?? []) as unknown as ProgressRow[]
  const avgProgress = progressRows.length > 0
    ? progressRows.reduce((sum, p) => sum + p.completion_pct, 0) / progressRows.length
    : 0

  // Funcionários sem atividade recente (view inactive_employees)
  const { data: inactive, count: inactiveCount } = await supabase
    .from('inactive_employees')
    .select('*', { count: 'exact' })

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Painel</h1>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 text-brand-blue mb-2">
            <Users size={18} />
            <span className="text-xs font-medium uppercase tracking-wide">Funcionários</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalEmployees ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">ativos</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-brand-green mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-medium uppercase tracking-wide">Progresso</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatPercent(avgProgress)}</p>
          <p className="text-xs text-gray-400 mt-0.5">médio geral</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-yellow-600 mb-2">
            <Award size={18} />
            <span className="text-xs font-medium uppercase tracking-wide">Certificados</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{certCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">emitidos</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertCircle size={18} />
            <span className="text-xs font-medium uppercase tracking-wide">Inativos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{inactiveCount ?? 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">+7 dias sem treinar</p>
        </div>
      </div>

      {/* Lista de funcionários */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Funcionários</h2>
        <Link href="/gerente/funcionarios" className="text-brand-blue text-sm font-medium">
          Ver todos →
        </Link>
      </div>

      <div className="space-y-2">
        {(employees ?? []).slice(0, 5).map((emp) => (
          <div key={emp.id} className="card flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
              <span className="text-brand-blue font-bold text-sm">
                {emp.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{emp.name}</p>
              <p className="text-xs text-gray-400 capitalize">{emp.sector ?? 'Geral'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certificados confirmados */}
      {(certCount ?? 0) > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900 mb-3">Certificados Confirmados</h2>
          <div className="space-y-2">
            {(certs ?? []).slice(0, 5).map((cert: Record<string, unknown>) => (
              <div key={cert.id as string} className="card flex items-center gap-3">
                <Award size={18} className="text-brand-green flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {cert.employee_name as string}
                  </p>
                  <p className="text-xs text-gray-400">{cert.track_name as string}</p>
                </div>
                <p className="font-mono text-xs text-gray-300">
                  {(cert.verification_code as string)?.slice(0, 8)}…
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
