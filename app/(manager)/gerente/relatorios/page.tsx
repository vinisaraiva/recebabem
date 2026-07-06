/**
 * Relatórios do gerente — /gerente/relatorios
 * Progresso por trilha, funcionários mais ativos, inativos.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart2, TrendingUp, AlertCircle, Award } from 'lucide-react'
import { formatPercent, formatRelativeDate } from '@/lib/utils/format'

export const metadata = { title: 'Relatórios' }

export default async function RelatoriosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Progresso por trilha (média entre todos os funcionários do hotel)
  const { data: trackStats } = await supabase
    .from('track_progress')
    .select(`
      completion_pct, completed_at,
      tracks ( name, icon ),
      profiles!inner ( role )
    `)
    .eq('profiles.role', 'employee')

  // Agrupa por trilha
  const byTrack: Record<string, { name: string; icon: string; total: number; count: number; completed: number }> = {}
  for (const tp of (trackStats ?? [])) {
    const track = tp.tracks as { name: string; icon: string } | null
    if (!track) continue
    const key = track.name
    if (!byTrack[key]) byTrack[key] = { name: track.name, icon: track.icon ?? '📚', total: 0, count: 0, completed: 0 }
    byTrack[key].total   += tp.completion_pct
    byTrack[key].count   += 1
    if (tp.completed_at) byTrack[key].completed += 1
  }

  const trackRows = Object.values(byTrack).map((t) => ({
    ...t,
    avg: t.count > 0 ? Math.round(t.total / t.count) : 0,
  })).sort((a, b) => b.avg - a.avg)

  // Top funcionários — view hotel_rankings já tem aggregate + RLS, retorna 5 linhas em vez de N
  const { data: rankingData } = await supabase
    .from('hotel_rankings')
    .select('profile_id, name, total_points')
    .order('total_points', { ascending: false })
    .limit(5)

  const topEmployees = (rankingData ?? []).map((r) => ({
    profile_id: r.profile_id as string,
    name:       r.name        as string,
    total:      (r.total_points as number) ?? 0,
  }))

  // Funcionários inativos (view)
  const { data: inactive } = await supabase
    .from('inactive_employees')
    .select('*')
    .limit(10)

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart2 size={24} className="text-brand-blue" />
        Relatórios
      </h1>

      {/* Progresso por trilha */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-green" />
          Progresso por Trilha
        </h2>
        {trackRows.length === 0 ? (
          <div className="card text-center py-6 text-gray-400 text-sm">
            Nenhum progresso registrado ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {trackRows.map((track) => (
              <div key={track.name} className="card">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{track.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900 text-sm">{track.name}</p>
                      <span className="text-sm font-bold text-gray-700">{formatPercent(track.avg)}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {track.count} aluno{track.count !== 1 ? 's' : ''} · {track.completed} concluíram
                    </p>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${track.avg}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top funcionários */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Award size={16} className="text-yellow-500" />
            Mais Ativos
          </h2>
          <div className="space-y-2">
            {topEmployees.map((emp, idx) => (
              <div key={emp.profile_id} className="card flex items-center gap-3">
                <span className="text-lg w-6 text-center">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                </span>
                <p className="flex-1 text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                <p className="text-sm font-bold text-gray-700">
                  {emp.total.toLocaleString('pt-BR')} pts
                </p>
              </div>
            ))}
            {topEmployees.length === 0 && (
              <div className="card text-center py-4 text-gray-400 text-xs">
                Nenhuma pontuação ainda.
              </div>
            )}
          </div>
        </section>

        {/* Funcionários inativos */}
        <section>
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            Precisam de Atenção
          </h2>
          <div className="space-y-2">
            {(inactive ?? []).map((emp: Record<string, unknown>) => (
              <div key={emp.id as string} className="card flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 font-bold text-xs">
                    {(emp.name as string)?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{emp.name as string}</p>
                  <p className="text-xs text-red-400">
                    Último acesso: {emp.last_activity_date
                      ? formatRelativeDate(emp.last_activity_date as string)
                      : 'nunca'}
                  </p>
                </div>
              </div>
            ))}
            {(inactive ?? []).length === 0 && (
              <div className="card text-center py-4 text-gray-400 text-xs">
                ✅ Todos ativos nos últimos 7 dias!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
