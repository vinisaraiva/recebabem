/**
 * Editor visual de trilhas por plano.
 * Grid: planos nas colunas, trilhas nas linhas — checkboxes para vincular.
 */
'use client'

import { useState, useTransition } from 'react'
import { Loader2, Check } from 'lucide-react'
import { togglePlanTrack } from '@/lib/actions/admin-plans'

interface Plan  { id: string; slug: string; name: string; price_monthly: number | null }
interface Track { id: string; slug: string; name: string; icon: string | null }
interface PlanTrack { plan_id: string; track_id: string }

interface Props {
  plans:      Plan[]
  tracks:     Track[]
  planTracks: PlanTrack[]
}

const PLAN_LABEL: Record<string, { label: string; color: string }> = {
  starter:    { label: 'Starter',    color: 'bg-gray-100 text-gray-700' },
  pro:        { label: 'Pro',        color: 'bg-blue-100 text-blue-700' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700' },
}

export default function PlanTracksEditor({ plans, tracks, planTracks }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved]   = useState<string | null>(null)
  const [error, setError]   = useState<string | null>(null)

  // Set para lookup rápido "planId|trackId"
  const [linked, setLinked] = useState<Set<string>>(
    new Set(planTracks.map((pt) => `${pt.plan_id}|${pt.track_id}`))
  )

  function isLinked(planId: string, trackId: string) {
    return linked.has(`${planId}|${trackId}`)
  }

  function toggle(planId: string, trackId: string) {
    const key     = `${planId}|${trackId}`
    const active  = linked.has(key)

    // Optimistic update
    setLinked((prev) => {
      const next = new Set(prev)
      active ? next.delete(key) : next.add(key)
      return next
    })

    setError(null)
    startTransition(async () => {
      const result = await togglePlanTrack(planId, trackId, !active)
      if (!result.success) {
        // Reverte
        setLinked((prev) => {
          const next = new Set(prev)
          active ? next.add(key) : next.delete(key)
          return next
        })
        setError('Erro ao salvar. Tente novamente.')
      } else {
        setSaved(key)
        setTimeout(() => setSaved(null), 1500)
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-4 font-semibold text-gray-700 w-48">
                Trilha
              </th>
              {plans.map((plan) => {
                const style = PLAN_LABEL[plan.slug] ?? { label: plan.name, color: 'bg-gray-100 text-gray-600' }
                return (
                  <th key={plan.id} className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${style.color}`}>
                      {style.label}
                    </span>
                    {plan.price_monthly != null && (
                      <p className="text-xs text-gray-400 font-normal mt-0.5">
                        R$ {plan.price_monthly}/mês
                      </p>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {tracks.map((track, idx) => (
              <tr
                key={track.id}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              >
                <td className="px-5 py-3.5 font-medium text-gray-900">
                  <span className="mr-2">{track.icon ?? '📚'}</span>
                  {track.name}
                </td>
                {plans.map((plan) => {
                  const key    = `${plan.id}|${track.id}`
                  const active = isLinked(plan.id, track.id)
                  const saving = isPending && saved === null

                  return (
                    <td key={plan.id} className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => toggle(plan.id, track.id)}
                        disabled={isPending}
                        aria-label={`${active ? 'Remover' : 'Adicionar'} ${track.name} do plano ${plan.name}`}
                        className={`
                          w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto
                          transition-all duration-150
                          ${active
                            ? 'bg-brand-green border-brand-green text-white'
                            : 'border-gray-200 text-transparent hover:border-gray-300'
                          }
                          ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                        `}
                      >
                        {isPending && saved === key
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Check size={14} strokeWidth={2.5} />
                        }
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Alterações aplicam-se apenas a novos hotéis. Para hotéis existentes, ajuste manualmente em Hotéis → detalhe do hotel.
      </p>
    </div>
  )
}
