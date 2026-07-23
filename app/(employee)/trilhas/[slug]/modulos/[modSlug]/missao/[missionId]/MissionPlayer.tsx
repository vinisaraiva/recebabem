/**
 * MissionPlayer — renderiza o gameplay e gerencia a fila de missões.
 * Fila via URL param: missões erradas vão pro fim, corretas avançam.
 * Quando fila esvazia + acerto → tela de módulo concluído.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, X, Trophy, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { completeMission } from '@/lib/actions/missions'
import { claimDailyBonus } from '@/lib/actions/daily-challenge'

import QuizMission           from '@/components/missions/QuizMission'
import FillBlankMission      from '@/components/missions/FillBlankMission'
import MatchPairsMission     from '@/components/missions/MatchPairsMission'
import WordOrderMission      from '@/components/missions/WordOrderMission'
import ListenRepeatMission   from '@/components/missions/ListenRepeatMission'
import ListenIdentifyMission from '@/components/missions/ListenIdentifyMission'
import SimulationMission     from '@/components/missions/SimulationMission'

import type { Json } from '@/types/database'

interface Mission {
  id:            string
  name:          string
  type:          string
  content:       Json
  points_reward: number
  module_id:     string
}

interface Progress {
  status:   string
  score:    number | null
  attempts: number
}

interface Props {
  mission:          Mission
  existingProgress: Progress | null
  userId:           string
  backHref:         string
  /** IDs das missões que vêm após a atual (fila). Vazio = última da sessão. */
  fila:             string
  /** Total de missões na sessão (para barra de progresso). 0 = fora de sessão. */
  total:            number
  /** Missão aberta via Desafio do Dia — credita bônus 2× ao acertar. */
  isDesafio?:       boolean
}

type GameState = 'playing' | 'correct' | 'wrong' | 'already_done' | 'module_complete'

export default function MissionPlayer({
  mission, existingProgress, backHref, fila, total, isDesafio = false,
}: Props) {
  const router = useRouter()

  // Parsed queue: IDs restantes após a missão atual
  const filaIds = fila ? fila.split(',').filter(Boolean) : []
  const inSession = total > 0

  // Em sessão, sempre permite responder; fora de sessão, respeita completed
  const initialState: GameState =
    !inSession && existingProgress?.status === 'completed' ? 'already_done' : 'playing'

  const [state,       setState]       = useState<GameState>(initialState)
  const [loading,     setLoading]     = useState(false)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [bonusEarned, setBonusEarned] = useState(0)

  /** Extrai slug e modSlug do backHref para montar URL */
  function nextMissionUrl(nextId: string, nextFila: string[]) {
    // backHref = /trilhas/[slug]/modulos/[modSlug]
    const parts    = backHref.split('/')          // ['', 'trilhas', slug, 'modulos', modSlug]
    const slug     = parts[2] ?? ''
    const modSlug  = parts[4] ?? ''
    const filaParam = nextFila.join(',')
    return `/trilhas/${slug}/modulos/${modSlug}/missao/${nextId}?fila=${filaParam}&total=${total}`
  }

  async function handleAnswer(correct: boolean, score = 100) {
    if (loading) return
    setLoading(true)

    const newState = correct ? 'correct' : 'wrong'
    setState(newState)
    if (correct) setPointsEarned(mission.points_reward)

    await completeMission({ missionId: mission.id, score: correct ? score : 0, correct })

    // Desafio do Dia: credita bônus 2× ao acertar
    if (correct && isDesafio) {
      const result = await claimDailyBonus(mission.id)
      if (result.success && result.bonusPoints) {
        setBonusEarned(result.bonusPoints)
      }
    }

    setLoading(false)
  }

  function handleContinue() {
    if (state === 'correct') {
      if (filaIds.length > 0) {
        // Acertou e tem mais: avança na fila
        router.push(nextMissionUrl(filaIds[0], filaIds.slice(1)))
      } else if (inSession) {
        // Acertou a última da sessão: módulo concluído!
        setState('module_complete')
      } else {
        // Fora de sessão: volta ao módulo
        router.push(backHref)
        router.refresh()
      }

    } else if (state === 'wrong') {
      if (filaIds.length > 0) {
        // Errou e tem mais: avança mas coloca atual no fim da fila
        router.push(nextMissionUrl(filaIds[0], [...filaIds.slice(1), mission.id]))
      } else if (inSession) {
        // Errou e é a última (ou única) restante: tenta de novo
        setState('playing')
      } else {
        router.push(backHref)
        router.refresh()
      }

    } else {
      // already_done fora de sessão
      router.push(backHref)
      router.refresh()
    }
  }

  const content = mission.content as Record<string, unknown>

  // ── Progresso da sessão ────────────────────────────────────────────────────
  const progressPct = inSession
    ? Math.round(((total - filaIds.length - 1) / total) * 100)
    : 33

  // ── Tela de conclusão do módulo ────────────────────────────────────────────
  if (state === 'module_complete') {
    return (
      <div className="min-h-screen bg-brand-sand flex flex-col items-center justify-center px-6 max-w-md mx-auto text-center">
        <div className="w-24 h-24 rounded-full bg-brand-green/10 flex items-center justify-center mb-6 animate-bounce-slow">
          <Trophy size={48} className="text-brand-green" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Módulo concluído!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Você respondeu todas as questões corretamente. Continue praticando!
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 mb-8 w-full">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pontos ganhos</p>
          <div className="flex items-center justify-center gap-2 text-yellow-500">
            <Zap size={20} />
            <span className="text-2xl font-bold">{pointsEarned}</span>
          </div>
        </div>

        <Link
          href={backHref}
          className="w-full py-4 rounded-2xl bg-brand-green text-white font-bold text-base text-center block active:scale-95 transition-transform"
        >
          Voltar ao módulo
        </Link>
      </div>
    )
  }

  // ── Gameplay normal ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-sand flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3">
        <Link href={backHref} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <X size={22} />
        </Link>

        {/* Barra de progresso da sessão */}
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-3 bg-brand-green rounded-full transition-all duration-500"
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>

        {/* Pontos */}
        <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
          <Zap size={16} />
          <span className="text-sm font-bold">{mission.points_reward}</span>
        </div>
      </div>

      {/* Missões restantes na sessão */}
      {inSession && state === 'playing' && filaIds.length > 0 && (
        <p className="text-center text-xs text-gray-400 pb-1">
          {filaIds.length} {filaIds.length === 1 ? 'questão restante' : 'questões restantes'}
        </p>
      )}

      {/* Imagem ilustrativa — opcional, definida no content.image_url da missão */}
      {content.image_url && typeof content.image_url === 'string' && (
        <div className="relative w-full h-44 mx-0 overflow-hidden">
          {/* img direto no CDN do Supabase — já é WebP/800px, não precisa proxy Vercel */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.image_url}
            alt={mission.name}
            className="w-full h-full object-cover"
          />
          {/* Gradiente suave na base para transição com o conteúdo */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-brand-sand to-transparent" />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 px-4 py-2">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{mission.name}</h2>

        {state === 'already_done' && (
          <div className="card text-center py-8 mb-4">
            <p className="text-4xl mb-2">✅</p>
            <p className="font-semibold text-brand-green">Missão já concluída!</p>
            <p className="text-gray-400 text-sm mt-1">
              Pontuação: {existingProgress?.score ?? 0}/100
            </p>
          </div>
        )}

        {state === 'playing' && (
          <>
            {mission.type === 'quiz'            && <QuizMission           content={content} onAnswer={handleAnswer} />}
            {mission.type === 'fill_blank'      && <FillBlankMission      content={content} onAnswer={handleAnswer} />}
            {mission.type === 'match_pairs'     && <MatchPairsMission     content={content} onAnswer={handleAnswer} />}
            {mission.type === 'word_order'      && <WordOrderMission      content={content} onAnswer={handleAnswer} />}
            {mission.type === 'listen_repeat'   && <ListenRepeatMission   content={content} onAnswer={handleAnswer} />}
            {mission.type === 'listen_identify' && <ListenIdentifyMission content={content} onAnswer={handleAnswer} />}
            {mission.type === 'simulation'      && <SimulationMission     content={content} onAnswer={handleAnswer} />}
          </>
        )}
      </div>

      {/* Painel de feedback */}
      {(state === 'correct' || state === 'wrong' || state === 'already_done') && (
        <div className={`px-4 pt-5 pb-8 ${
          state === 'correct'
            ? 'bg-green-50 border-t-2 border-brand-green'
            : state === 'wrong'
            ? 'bg-red-50 border-t-2 border-red-400'
            : 'bg-gray-50 border-t border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">
              {state === 'correct' ? '🎉' : state === 'wrong' ? '💡' : '📖'}
            </span>
            <div>
              <p className={`font-bold text-sm ${
                state === 'correct' ? 'text-brand-green'
                : state === 'wrong' ? 'text-red-600'
                : 'text-gray-700'
              }`}>
                {state === 'correct'
                  ? `Correto! +${mission.points_reward} pts`
                  : state === 'wrong'
                  ? filaIds.length > 0
                    ? 'Quase lá! Voltará no fim da fila.'
                    : 'Tente novamente!'
                  : 'Você já completou esta missão.'}
              </p>
              {state === 'correct' && bonusEarned > 0 && (
                <p className="text-yellow-600 text-xs font-semibold mt-0.5">
                  ⚡ +{bonusEarned} bônus Desafio do Dia!
                </p>
              )}
              {state === 'wrong' && content.explanation && (
                <p className="text-red-500 text-xs mt-0.5">
                  {content.explanation as string}
                </p>
              )}
              {state === 'correct' && content.explanation && (
                <p className="text-green-600 text-xs mt-0.5">
                  {content.explanation as string}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${
              state === 'correct'      ? 'bg-brand-green hover:bg-brand-green-dark'
              : state === 'wrong' && filaIds.length === 0 && inSession
                                       ? 'bg-brand-blue hover:bg-brand-blue-dark'
              : state === 'wrong'      ? 'bg-red-500 hover:bg-red-600'
              : 'bg-brand-blue hover:bg-brand-blue-dark'
            }`}
          >
            {state === 'wrong' && filaIds.length === 0 && inSession && (
              <RotateCcw size={16} />
            )}
            {state === 'wrong' && filaIds.length === 0 && inSession
              ? 'Tentar novamente'
              : 'Continuar'}
          </button>
        </div>
      )}
    </div>
  )
}
