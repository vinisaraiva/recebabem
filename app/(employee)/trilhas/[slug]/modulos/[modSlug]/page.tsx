/**
 * Detalhe do módulo — lista missões e oferece sessão sequencial com fila.
 * "Iniciar" monta a fila de incompletas; "Refazer" usa todas as missões.
 */
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Lock, Zap, Play, RotateCcw } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string; modSlug: string }>
}

const TYPE_ICONS: Record<string, string> = {
  listen_repeat:   '🎧',
  listen_identify: '🎧',
  quiz:            '❓',
  simulation:      '🎭',
  match_pairs:     '🃏',
  fill_blank:      '✏️',
  word_order:      '🔤',
}

export default async function ModuloPage({ params }: Props) {
  const { slug, modSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: track } = await supabase
    .from('tracks')
    .select('id, name, color, icon')
    .eq('slug', slug)
    .single()
  if (!track) notFound()

  const { data: module } = await supabase
    .from('modules')
    .select('id, name, description')
    .eq('slug', modSlug)
    .eq('track_id', track.id)
    .single()
  if (!module) notFound()

  const { data: missions } = await supabase
    .from('missions')
    .select('id, name, type, points_reward, order_index')
    .eq('module_id', module.id)
    .eq('active', true)
    .order('order_index')

  const missionList = missions ?? []
  const missionIds  = missionList.map((m) => m.id)

  const { data: progress } = await supabase
    .from('mission_progress')
    .select('mission_id, status, score')
    .eq('profile_id', user.id)
    .in('mission_id', missionIds)

  const progressMap = Object.fromEntries(
    (progress ?? []).map((p) => [p.mission_id, p])
  )

  const { data: modProg } = await supabase
    .from('module_progress')
    .select('completion_pct')
    .eq('profile_id', user.id)
    .eq('module_id', module.id)
    .maybeSingle()

  // ── Lógica da fila de sessão ──────────────────────────────────────────────
  const incomplete   = missionList.filter((m) => progressMap[m.id]?.status !== 'completed')
  const allDone      = incomplete.length === 0 && missionList.length > 0
  const hasStarted   = incomplete.length < missionList.length && incomplete.length > 0

  // Sessão usa incompletas; refazer usa todas
  const sessionIds   = allDone ? missionIds : incomplete.map((m) => m.id)
  const firstId      = sessionIds[0]
  const restIds      = sessionIds.slice(1)

  function buildSessionUrl(ids: string[]) {
    if (!ids[0]) return null
    const fila = ids.slice(1).join(',')
    return `/trilhas/${slug}/modulos/${modSlug}/missao/${ids[0]}?fila=${fila}&total=${ids.length}`
  }

  const sessionUrl = buildSessionUrl(sessionIds)

  return (
    <div className="px-4 pt-4 pb-8 max-w-md mx-auto">
      {/* Voltar */}
      <Link
        href={`/trilhas/${slug}`}
        className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-gray-600"
      >
        <ChevronLeft size={16} /> {track.name}
      </Link>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">{module.name}</h1>
        {module.description && (
          <p className="text-gray-500 text-sm mt-0.5">{module.description}</p>
        )}
        <div className="progress-bar mt-3">
          <div
            className="progress-fill"
            style={{ width: `${modProg?.completion_pct ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {Math.round(modProg?.completion_pct ?? 0)}% concluído
        </p>
      </div>

      {/* Botão de iniciar sessão */}
      {sessionUrl && (
        <Link
          href={sessionUrl}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl
                     font-bold text-white mb-5 transition-all active:scale-95
                     bg-brand-blue hover:bg-brand-blue-dark"
        >
          {allDone
            ? <><RotateCcw size={18} /> Refazer Módulo</>
            : hasStarted
            ? <><Play size={18} /> Continuar Módulo</>
            : <><Play size={18} /> Iniciar Módulo</>
          }
        </Link>
      )}

      {/* Lista de missões */}
      <div className="space-y-2">
        {missionList.map((mission, idx) => {
          const prog      = progressMap[mission.id]
          const completed = prog?.status === 'completed'
          const prev      = idx > 0 ? missionList[idx - 1] : null
          const prevDone  = !prev || progressMap[prev.id]?.status === 'completed'
          const locked    = idx > 0 && !prevDone

          return (
            <div key={mission.id}>
              {locked ? (
                <div className="card flex items-center gap-4 opacity-50 cursor-not-allowed">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Lock size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium">{mission.name}</p>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/trilhas/${slug}/modulos/${modSlug}/missao/${mission.id}`}
                  className={`card flex items-center gap-4 hover:shadow-md transition-shadow ${
                    completed ? 'border-brand-green/30' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    completed ? 'bg-brand-green/10' : 'bg-brand-blue/10'
                  }`}>
                    {completed
                      ? <CheckCircle2 size={20} className="text-brand-green" />
                      : <span>{TYPE_ICONS[mission.type] ?? '📖'}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{mission.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {mission.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                    <Zap size={14} />
                    <span className="text-xs font-bold">{mission.points_reward}</span>
                  </div>
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
