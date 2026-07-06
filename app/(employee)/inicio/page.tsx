/**
 * Home do funcionário — /inicio
 * Exibe streak, pontos, trilhas em progresso e missão do dia.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatRelativeDate } from '@/lib/utils/format'
import { Flame, Star, BookOpen, Award, User } from 'lucide-react'
import Link from 'next/link'
import type { Tables } from '@/types/database'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export const metadata = { title: 'Início' }

export default async function InicioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Carrega dados do perfil + streak + pontos em paralelo
  const [profileRes, streakRes, trackProgressRes, pointsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single(),

    supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('profile_id', user.id)
      .maybeSingle(),

    supabase
      .from('track_progress')
      .select(`
        completion_pct,
        started_at,
        tracks ( name, icon, color, slug )
      `)
      .eq('profile_id', user.id)
      .lt('completion_pct', 100)
      .order('updated_at', { ascending: false })
      .limit(3),

    // Aggregate no DB — retorna 1 objeto em vez de N linhas
    supabase
      .from('points_ledger')
      .select('amount.sum()')
      .eq('profile_id', user.id)
      .single(),
  ])

  const totalPoints = (pointsRes.data as { sum: number } | null)?.sum ?? 0

  const profile        = profileRes.data
  const streak         = streakRes.data
  const activeTracks   = trackProgressRes.data ?? []
  const firstName      = profile?.name?.split(' ')[0] ?? 'Olá'

  return (
    <div className="px-4 pt-8 pb-4 max-w-md mx-auto">
      {/* Onboarding — aparece só na 1ª visita */}
      <OnboardingFlow />
      {/* Saudação */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Continue aprendendo hoje</p>
        </div>
        <Link
          href="/perfil"
          className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center hover:bg-brand-blue/20 transition-colors"
          aria-label="Meu perfil"
        >
          <User size={18} className="text-brand-blue" />
        </Link>
      </div>

      {/* Cards de streak e pontos */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Flame size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {streak?.current_streak ?? 0}
            </p>
            <p className="text-xs text-gray-500">dias seguidos</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Star size={20} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {totalPoints.toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-gray-500">pontos</p>
          </div>
        </div>
      </div>

      {/* Trilhas em progresso */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-blue" />
            Minhas Trilhas
          </h2>
          <Link href="/trilhas" className="text-brand-blue text-sm font-medium">
            Ver todas
          </Link>
        </div>

        {activeTracks.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-400 text-sm">Nenhuma trilha em progresso</p>
            <Link href="/trilhas" className="text-brand-blue text-sm font-medium mt-2 inline-block">
              Começar uma trilha →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTracks.map((tp) => {
              const track = tp.tracks as Tables<'tracks'> | null
              if (!track) return null
              return (
                <Link
                  key={track.slug}
                  href={`/trilhas/${track.slug}`}
                  className="card flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl">{track.icon ?? '📚'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{track.name}</p>
                    <div className="progress-bar mt-1">
                      <div
                        className="progress-fill"
                        style={{ width: `${tp.completion_pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Math.round(tp.completion_pct)}% concluído
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Certificados */}
      <section>
        <Link
          href="/certificados"
          className="card flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
            <Award size={20} className="text-brand-green" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Certificados</p>
            <p className="text-xs text-gray-500">Veja suas conquistas</p>
          </div>
          <span className="text-gray-400">→</span>
        </Link>
      </section>
    </div>
  )
}
