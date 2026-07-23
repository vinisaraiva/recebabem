/**
 * Banner do Desafio do Dia — exibido no /inicio.
 * Server Component: recebe os dados já resolvidos pelo page.tsx.
 */
import Link from 'next/link'
import { Zap, CheckCircle2 } from 'lucide-react'
import type { DailyChallenge } from '@/lib/actions/daily-challenge'

const MISSION_TYPE_LABELS: Record<string, string> = {
  quiz:            'Quiz',
  fill_blank:      'Complete a frase',
  match_pairs:     'Caça-par',
  word_order:      'Monte a frase',
  listen_repeat:   'Ouça e repita',
  listen_identify: 'Identifique o áudio',
  simulation:      'Simulação de diálogo',
}

interface Props {
  challenge: DailyChallenge
}

export default function DailyChallengeCard({ challenge }: Props) {
  const { mission, track, moduleSlug, bonusPoints, alreadyClaimed } = challenge

  const missionUrl = `/trilhas/${track.slug}/modulos/${moduleSlug}/missao/${mission.id}?desafio=true`
  const typeLabel  = MISSION_TYPE_LABELS[mission.type] ?? mission.type

  if (alreadyClaimed) {
    return (
      <div className="card bg-gradient-to-br from-brand-green/10 to-emerald-50 border border-brand-green/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-green/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} className="text-brand-green" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-green uppercase tracking-wide mb-0.5">
              Desafio do Dia ✓
            </p>
            <p className="font-medium text-gray-900 truncate">{mission.name}</p>
            <p className="text-xs text-gray-500">
              +{bonusPoints} bônus recebidos! Volte amanhã para um novo desafio.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={missionUrl}
      className="card bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-center gap-3">
        {/* Ícone */}
        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap size={20} className="text-yellow-500" />
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-0.5">
            ⚡ Desafio do Dia
          </p>
          <p className="font-medium text-gray-900 truncate">{mission.name}</p>
          <p className="text-xs text-gray-500">{track.icon} {track.name} · {typeLabel}</p>
        </div>

        {/* Bônus */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-yellow-600 font-semibold">2×</p>
          <p className="text-sm font-bold text-gray-900">{mission.points_reward * 2}</p>
          <p className="text-xs text-gray-400">pts</p>
        </div>
      </div>
    </Link>
  )
}
