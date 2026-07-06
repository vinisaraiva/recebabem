/**
 * Detalhe de uma trilha — /trilhas/[slug]
 * Lista módulos em sequência com progresso e lock.
 */
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, CheckCircle2, Lock } from 'lucide-react'
import RequestCertificateButton from '@/components/employee/RequestCertificateButton'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return { title: slug.replace(/-/g, ' ') }
}

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase  = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Busca a trilha pelo slug
  const { data: track } = await supabase
    .from('tracks')
    .select('id, name, description, icon, color, level')
    .eq('slug', slug)
    .single()

  if (!track) notFound()

  // Módulos da trilha (ordenados)
  const { data: modules } = await supabase
    .from('modules')
    .select('id, name, description, slug, order_index')
    .eq('track_id', track.id)
    .eq('active', true)
    .order('order_index')

  // Progresso nos módulos
  const moduleIds = (modules ?? []).map((m) => m.id)
  const { data: modProgress } = await supabase
    .from('module_progress')
    .select('module_id, completion_pct, completed_at')
    .eq('profile_id', user.id)
    .in('module_id', moduleIds)

  const modProgressMap = Object.fromEntries(
    (modProgress ?? []).map((p) => [p.module_id, p])
  )

  // Progresso geral da trilha
  const { data: trackProg } = await supabase
    .from('track_progress')
    .select('completion_pct')
    .eq('profile_id', user.id)
    .eq('track_id', track.id)
    .maybeSingle()

  const overallPct  = trackProg?.completion_pct ?? 0
  const isCompleted = overallPct >= 100

  return (
    <div className="px-4 pt-6 max-w-md mx-auto">
      {/* Header da trilha */}
      <div
        className="rounded-2xl p-5 mb-6 text-white"
        style={{ backgroundColor: track.color ?? '#1565C0' }}
      >
        <span className="text-4xl">{track.icon ?? '📚'}</span>
        <h1 className="text-xl font-bold mt-2">{track.name}</h1>
        {track.description && (
          <p className="text-white/80 text-sm mt-1">{track.description}</p>
        )}
        {/* Barra de progresso */}
        <div className="mt-3 bg-white/20 rounded-full h-2">
          <div
            className="h-2 bg-white rounded-full transition-all duration-500"
            style={{ width: `${overallPct}%` }}
          />
        </div>
        <p className="text-white/70 text-xs mt-1">
          {Math.round(overallPct)}% concluído
        </p>
      </div>

      {/* Botão de solicitar certificado (apenas quando 100%) */}
      {isCompleted && (
        <div className="mb-4">
          <RequestCertificateButton trackId={track.id} />
        </div>
      )}

      {/* Lista de módulos */}
      <div className="space-y-2">
        {(modules ?? []).map((mod, idx) => {
          const prog      = modProgressMap[mod.id]
          const pct       = prog?.completion_pct ?? 0
          const completed = pct >= 100

          // Módulo bloqueado se o anterior não foi completado
          const prevMod   = idx > 0 ? modules![idx - 1] : null
          const prevDone  = !prevMod || (modProgressMap[prevMod.id]?.completion_pct ?? 0) >= 100
          const locked    = idx > 0 && !prevDone

          return (
            <div key={mod.id}>
              {locked ? (
                <div className="card flex items-center gap-4 opacity-60 cursor-not-allowed">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-500">{mod.name}</p>
                    <p className="text-xs text-gray-400">Complete o módulo anterior</p>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/trilhas/${slug}/modulos/${mod.slug}`}
                  className="card flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                    {completed
                      ? <CheckCircle2 size={20} className="text-brand-green" />
                      : <span className="font-bold text-brand-blue text-sm">{idx + 1}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{mod.name}</p>
                    {pct > 0 && pct < 100 && (
                      <div className="progress-bar mt-1">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    {completed && (
                      <p className="text-xs text-brand-green">Concluído ✓</p>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
