/**
 * Ranking do hotel — /ranking
 * Abas: Geral (all-time) e Semana (pontos da semana corrente).
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart2, Flame } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Ranking' }

interface Props {
  searchParams: Promise<{ periodo?: string }>
}

export default async function RankingPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { periodo } = await searchParams
  const isWeekly = periodo === 'semana'

  // Verifica se o gerente habilitou o ranking para este hotel
  const { data: hotelId } = await supabase.rpc('get_my_hotel_id')
  const { data: settings } = hotelId
    ? await supabase
        .from('hotel_settings')
        .select('ranking_visible')
        .eq('hotel_id', hotelId)
        .single()
    : { data: null }

  // ── Ranking Geral (all-time via view) ─────────────────────────────────────
  let ranking: Array<{
    profile_id: string
    name: string
    total_points: number
    current_streak: number
    rank: number
  }> = []

  if (!isWeekly) {
    const { data } = await supabase
      .from('hotel_rankings')
      .select('*')
      .order('rank', { ascending: true })
      .limit(20)
    ranking = (data ?? []) as typeof ranking
  }

  // ── Ranking Semanal ────────────────────────────────────────────────────────
  let weeklyRanking: Array<{
    profile_id: string
    name: string
    total_points: number
    rank: number
  }> = []

  if (isWeekly && hotelId) {
    // Início da semana = segunda-feira
    const now = new Date()
    const dayOfWeek = now.getDay()                          // 0=Dom ... 6=Sáb
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToMonday)
    weekStart.setHours(0, 0, 0, 0)

    const [pointsRes, employeesRes] = await Promise.all([
      supabase
        .from('points_ledger')
        .select('profile_id, amount')
        .eq('hotel_id', hotelId)
        .gte('created_at', weekStart.toISOString()),

      supabase
        .from('profiles')
        .select('id, name')
        .eq('hotel_id', hotelId)
        .eq('role', 'employee')
        .eq('active', true),
    ])

    // Agrega pontos por funcionário
    const pointsByProfile: Record<string, number> = {}
    for (const row of pointsRes.data ?? []) {
      pointsByProfile[row.profile_id] = (pointsByProfile[row.profile_id] ?? 0) + row.amount
    }

    weeklyRanking = (employeesRes.data ?? [])
      .map((emp) => ({
        profile_id:   emp.id,
        name:         emp.name,
        total_points: pointsByProfile[emp.id] ?? 0,
        rank:         0,
      }))
      .filter((e) => e.total_points > 0)
      .sort((a, b) => b.total_points - a.total_points)
      .map((e, idx) => ({ ...e, rank: idx + 1 }))
  }

  const activeList = isWeekly ? weeklyRanking : ranking

  return (
    <div className="px-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart2 size={24} className="text-brand-blue" />
        Ranking
      </h1>

      {/* Abas */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <Link
          href="/ranking"
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
            !isWeekly
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Geral
        </Link>
        <Link
          href="/ranking?periodo=semana"
          className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors ${
            isWeekly
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Esta semana
        </Link>
      </div>

      {settings?.ranking_visible === false ? (
        <div className="card text-center py-12">
          <BarChart2 size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">O ranking está desativado para este hotel.</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400 text-sm">
            {isWeekly
              ? 'Nenhuma pontuação ainda esta semana. Comece agora!'
              : 'Nenhuma pontuação ainda. Comece a treinar!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeList.map((entry, idx) => {
            const rank           = entry.rank ?? idx + 1
            const name           = entry.name ?? 'Funcionário'
            const points         = entry.total_points ?? 0
            const streak         = (entry as Record<string, unknown>).current_streak as number | undefined
            const isCurrentUser  = entry.profile_id === user.id

            const medal =
              rank === 1 ? '🥇' :
              rank === 2 ? '🥈' :
              rank === 3 ? '🥉' : null

            return (
              <div
                key={entry.profile_id}
                className={`card flex items-center gap-3 ${
                  isCurrentUser ? 'ring-2 ring-brand-blue' : ''
                }`}
              >
                {/* Posição */}
                <div className="w-8 text-center">
                  {medal
                    ? <span className="text-xl">{medal}</span>
                    : <span className="text-gray-400 font-bold text-sm">{rank}</span>
                  }
                </div>

                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-blue font-bold text-sm">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Nome */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isCurrentUser ? 'text-brand-blue' : 'text-gray-900'}`}>
                    {name} {isCurrentUser && <span className="text-xs">(você)</span>}
                  </p>
                  {!isWeekly && streak && streak > 0 && (
                    <p className="text-xs text-orange-500 flex items-center gap-0.5">
                      <Flame size={12} /> {streak}d de sequência
                    </p>
                  )}
                </div>

                {/* Pontos */}
                <div className="text-right">
                  <p className="font-bold text-gray-900">{points.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">pts</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
