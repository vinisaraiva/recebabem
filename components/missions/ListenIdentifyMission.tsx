/**
 * Ouça e Identifique — toca áudio com texto oculto, usuário escolhe entre 4 opções.
 * Testa compreensão auditiva. Texto revelado somente após resposta.
 * Conteúdo: { phrase_en, audio_url?, options: string[], correct_index: number, explanation? }
 */
'use client'

import { useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Content {
  phrase_en:     string
  audio_url?:    string
  options:       string[]
  correct_index: number
  explanation?:  string
}

interface Props {
  content:  Record<string, unknown>
  onAnswer: (correct: boolean, score?: number) => void
}

type Speed = 'normal' | 'slow'

const RATES: Record<Speed, number> = { normal: 0.85, slow: 0.6 }

export default function ListenIdentifyMission({ content, onAnswer }: Props) {
  const { phrase_en, audio_url, options, correct_index } =
    content as unknown as Content

  // Embaralha opções no mount e remapeia o índice correto
  const [shuffled] = useState(() => {
    const correctText  = options[correct_index]
    const shuffledOpts = [...options].sort(() => Math.random() - 0.5)
    return { opts: shuffledOpts, correctIdx: shuffledOpts.indexOf(correctText) }
  })

  const [played,   setPlayed]   = useState(false)
  const [loading,  setLoading]  = useState<Speed | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  function playAudio(speed: Speed) {
    if (loading) return
    setLoading(speed)

    if (audio_url) {
      const audio = new Audio(audio_url)
      audio.playbackRate = speed === 'slow' ? 0.7 : 1.0
      audio.onended  = () => setLoading(null)
      audio.onerror  = () => setLoading(null)
      audio.play().catch(() => setLoading(null))
    } else {
      speechSynthesis.cancel()
      const utterance    = new SpeechSynthesisUtterance(phrase_en)
      utterance.lang     = 'en-US'
      utterance.rate     = RATES[speed]
      utterance.onend    = () => setLoading(null)
      utterance.onerror  = () => setLoading(null)
      speechSynthesis.speak(utterance)
    }

    setPlayed(true)
  }

  function handleSelect(idx: number) {
    if (selected !== null || !played) return
    setSelected(idx)
    setTimeout(() => onAnswer(idx === shuffled.correctIdx, 100), 700)
  }

  const answered = selected !== null

  return (
    <div className="space-y-5">
      {/* Instrução */}
      <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl px-4 py-3 text-center">
        <p className="text-brand-blue text-sm font-semibold">
          🎧 Ouça e selecione o que foi dito
        </p>
        {!played && (
          <p className="text-gray-400 text-xs mt-0.5">
            Toque em um botão para ouvir antes de responder
          </p>
        )}
      </div>

      {/* Botões de velocidade */}
      <div className="flex gap-3 justify-center">
        {/* Normal */}
        <button
          onClick={() => playAudio('normal')}
          disabled={loading !== null}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-blue text-white
                     font-semibold text-sm hover:bg-brand-blue-dark transition-all
                     active:scale-95 disabled:opacity-60"
        >
          {loading === 'normal'
            ? <Loader2 size={16} className="animate-spin" />
            : <Volume2 size={16} />
          }
          Normal
        </button>

        {/* Lento */}
        <button
          onClick={() => playAudio('slow')}
          disabled={loading !== null}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-brand-blue
                     text-brand-blue font-semibold text-sm hover:bg-brand-blue/5 transition-all
                     active:scale-95 disabled:opacity-60"
        >
          {loading === 'slow'
            ? <Loader2 size={16} className="animate-spin text-brand-blue" />
            : <Volume2 size={16} />
          }
          Lento
        </button>
      </div>

      {/* Opções — desabilitadas até ouvir */}
      <div
        className={cn(
          'space-y-2 transition-opacity duration-300',
          !played && 'opacity-40 pointer-events-none'
        )}
      >
        {!played && (
          <p className="text-center text-gray-400 text-xs mb-3">
            As opções serão liberadas após ouvir o áudio
          </p>
        )}

        {shuffled.opts.map((opt, idx) => {
          const isSelected = selected === idx
          const isCorrect  = idx === shuffled.correctIdx
          const showResult = answered

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered || !played}
              className={cn(
                'w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all',
                !showResult && 'border-gray-200 bg-white hover:border-brand-blue hover:bg-brand-blue/5',
                showResult && isSelected && isCorrect   && 'border-brand-green bg-green-50 text-brand-green',
                showResult && isSelected && !isCorrect  && 'border-red-400 bg-red-50 text-red-600',
                showResult && !isSelected && isCorrect  && 'border-brand-green/40 bg-green-50/50 text-brand-green',
                showResult && !isSelected && !isCorrect && 'border-gray-100 bg-gray-50 text-gray-400',
              )}
            >
              <span className="mr-2 text-gray-400 font-normal">
                {String.fromCharCode(65 + idx)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Revela texto após responder */}
      {answered && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-center border border-gray-100 animate-fade-in">
          <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
            O áudio dizia:
          </p>
          <p className="font-bold text-gray-900 text-base">{phrase_en}</p>
        </div>
      )}
    </div>
  )
}
