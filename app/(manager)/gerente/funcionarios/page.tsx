/**
 * Gestão de funcionários — /gerente/funcionarios
 * Lista, convida novos e vê progresso individual.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, UserPlus, Mail } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils/format'
import InviteButton from '@/components/manager/InviteButton'

export const metadata = { title: 'Funcionários' }

export default async function FuncionariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Funcionários ativos do hotel
  const { data: employees } = await supabase
    .from('profiles')
    .select('id, name, sector, active, created_at, onboarding_completed')
    .eq('role', 'employee')
    .order('name')

  // Progresso de trilhas por funcionário
  const empIds = (employees ?? []).map((e) => e.id)
  const { data: trackData } = await supabase
    .from('track_progress')
    .select('profile_id, completion_pct, completed_at')
    .in('profile_id', empIds)

  // Agrupa progresso por funcionário
  const progressByEmp: Record<string, { avg: number; completed: number }> = {}
  for (const tp of (trackData ?? [])) {
    if (!progressByEmp[tp.profile_id]) {
      progressByEmp[tp.profile_id] = { avg: 0, completed: 0 }
    }
    progressByEmp[tp.profile_id].avg += tp.completion_pct
    if (tp.completed_at) progressByEmp[tp.profile_id].completed++
  }

  // Convites pendentes
  const { data: pendingInvites } = await supabase
    .from('invitations')
    .select('id, email, name, role, created_at, expires_at')
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={24} className="text-brand-blue" />
          Funcionários
        </h1>
        <InviteButton />
      </div>

      {/* Lista de funcionários */}
      <div className="space-y-2 mb-8">
        {(employees ?? []).length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-gray-400">Nenhum funcionário cadastrado.</p>
            <p className="text-gray-400 text-sm mt-1">Use o botão "Convidar" para adicionar.</p>
          </div>
        ) : (
          (employees ?? []).map((emp) => {
            const prog        = progressByEmp[emp.id]
            const tracks      = trackData?.filter((t) => t.profile_id === emp.id).length ?? 0
            const avgPct      = tracks > 0 ? Math.round(prog?.avg / tracks) : 0

            return (
              <Link key={emp.id} href={`/gerente/funcionarios/${emp.id}`} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-blue font-bold">
                    {emp.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {emp.sector ?? 'Geral'} · {tracks} trilha{tracks !== 1 ? 's' : ''}
                  </p>
                  {tracks > 0 && (
                    <div className="progress-bar mt-1">
                      <div className="progress-fill" style={{ width: `${avgPct}%` }} />
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-700">{avgPct}%</p>
                  <p className="text-xs text-gray-400">progresso</p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Convites pendentes */}
      {(pendingInvites ?? []).length > 0 && (
        <>
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Mail size={16} /> Convites Pendentes
          </h2>
          <div className="space-y-2">
            {(pendingInvites ?? []).map((inv) => (
              <div key={inv.id} className="card flex items-center gap-3 border-dashed">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{inv.email}</p>
                  <p className="text-xs text-gray-400">
                    Enviado {formatRelativeDate(inv.created_at)} · expira {formatRelativeDate(inv.expires_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
