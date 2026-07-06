/**
 * Lista de trilhas do funcionário — /trilhas
 * Mostra trilhas disponíveis para o hotel com progresso do usuário.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Lock } from 'lucide-react'

export const metadata = { title: 'Trilhas' }

export default async function TrilhasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Trilhas disponíveis para o hotel + progresso do usuário
  const { data: hotelTracks } = await supabase
    .from('hotel_tracks')
    .select(`
      tracks (
        id, name, description, icon, color, slug, level,
        modules ( count )
      )
    `)
    .eq('active', true)

  // Progresso em cada trilha
  const { data: progressList } = await supabase
    .from('track_progress')
    .select('track_id, completion_pct, completed_at')
    .eq('profile_id', user.id)

  const progressMap = Object.fromEntries(
    (progressList ?? []).map((p) => [p.track_id, p])
  )

  const tracks = (hotelTracks ?? [])
    .map((ht) => ht.tracks)
    .filter(Boolean)

  return (
    <div className="px-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Trilhas</h1>
      <p className="text-gray-500 text-sm mb-6">
        Seu programa de treinamento
      </p>

      {tracks.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-400">Nenhuma trilha disponível ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => {
            if (!track) return null
            const progress  = progressMap[track.id]
            const pct       = progress?.completion_pct ?? 0
            const completed = pct >= 100
            const started   = pct > 0

            return (
              <Link
                key={track.slug}
                href={`/trilhas/${track.slug}`}
                className="card block hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${track.color ?? '#1565C0'}20` }}
                  >
                    {track.icon ?? '📚'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{track.name}</h3>
                      {completed && (
                        <CheckCircle2 size={16} className="text-brand-green flex-shrink-0" />
                      )}
                    </div>

                    {track.description && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">
                        {track.description}
                      </p>
                    )}

                    {/* Barra de progresso */}
                    <div className="mt-2">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          {started ? `${Math.round(pct)}% concluído` : 'Não iniciada'}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {track.level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
