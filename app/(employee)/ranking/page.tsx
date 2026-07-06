/**
 * Ranking do hotel — /ranking
 * Exibe o top 10 de funcionários do mesmo hotel por pontos.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart2, Crown, Flame } from 'lucide-react'

export const metadata = { title: 'Ranking' }

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verifica se o gerente habilitou o ranking para este hotel
  const { data: hotelId } = await supabase.rpc('get_my_hotel_id')
  const { data: settings } = hotelId
    ? await supabase
        .from('hotel_settings')
        .select('ranking_visible')
        .eq('hotel_id', hotelId)
        .single()
    : { data: null }

  // hotel_rankings é uma view com RLS — retorna apenas do mesmo hotel
  const { data: ranking } = await supabase
    .from('hotel_rankings')
    .select('*')
    .order('rank', { ascending: true })
    .limit(20)

  return (
    <div className="px-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <BarChart2 size={24} className="text-brand-blue" />
        Ranking
      </h1>
      <p className="text-gray-500 text-sm mb-6">Top funcionários do mês</p>

      {settings?.ranking_visible === false ? (
        <div className="card text-center py-12">
          <BarChart2 size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">O ranking está desativado para este hotel.</p>
        </div>
      ) : !ranking || ranking.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">Nenhuma pontuação ainda. Comece a treinar!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranking.map((entry: Record<string, unknown>, idx: number) => {
            const rank       = (entry.rank as number) ?? idx + 1
            const name       = (entry.name as string) ?? 'Funcionário'
            const points     = (entry.total_points as number) ?? 0
            const streak     = (entry.current_streak as number) ?? 0
            const isCurrentUser = entry.profile_id === user.id

            const medal =
              rank === 1 ? '🥇' :
              rank === 2 ? '🥈' :
              rank === 3 ? '🥉' : null

            return (
              <div
                key={entry.profile_id as string}
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
                  {streak > 0 && (
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
