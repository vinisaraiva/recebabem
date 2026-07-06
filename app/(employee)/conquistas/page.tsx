/**
 * Conquistas (badges) do funcionário — /conquistas
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'

export const metadata = { title: 'Conquistas' }

export default async function ConquistasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Todas as badges disponíveis + as que o usuário já ganhou
  const [allBadgesRes, myBadgesRes] = await Promise.all([
    supabase.from('badges').select('*').eq('active', true).order('condition_value'),
    supabase
      .from('employee_badges')
      .select('badge_id, earned_at')
      .eq('profile_id', user.id),
  ])

  const allBadges  = allBadgesRes.data ?? []
  const earnedMap  = Object.fromEntries(
    (myBadgesRes.data ?? []).map((b) => [b.badge_id, b.earned_at])
  )

  const earnedCount = Object.keys(earnedMap).length

  return (
    <div className="px-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Trophy size={24} className="text-yellow-500" />
        Conquistas
      </h1>
      <p className="text-gray-500 text-sm mb-1">
        {earnedCount} de {allBadges.length} desbloqueadas
      </p>

      {/* Barra de progresso */}
      <div className="progress-bar mb-6">
        <div
          className="progress-fill bg-yellow-400"
          style={{ width: `${allBadges.length ? (earnedCount / allBadges.length) * 100 : 0}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {allBadges.map((badge) => {
          const earned   = !!earnedMap[badge.id]
          const earnedAt = earnedMap[badge.id]

          return (
            <div
              key={badge.id}
              className={`card text-center transition-opacity ${earned ? '' : 'opacity-40'}`}
            >
              <div className="text-4xl mb-2">{badge.icon ?? '🏆'}</div>
              <p className="font-semibold text-gray-900 text-sm">{badge.name}</p>
              {badge.description && (
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                  {badge.description}
                </p>
              )}
              {earned && earnedAt && (
                <p className="text-brand-green text-xs mt-1 font-medium">
                  {formatDate(earnedAt)}
                </p>
              )}
              {!earned && (
                <p className="text-gray-300 text-xs mt-1">🔒 Bloqueada</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
