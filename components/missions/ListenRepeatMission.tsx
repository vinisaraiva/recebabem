/**
 * Ouvir e Repetir — toca áudio (normal ou lento) e exibe a transcrição com tradução.
 * Conteúdo: { phrase_en, phrase_pt, audio_url?, phonetic?, explanation? }
 * Confirmação manual (usuário diz se acertou) — sem STT nesta versão.
 */
'use client'

import { useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'

interface Content {
  phrase_en:    string
  phrase_pt:    string
  audio_url?:   string
  phonetic?:    string
  explanation?: string
}

interface Props {
  content:  Record<string, unknown>
  onAnswer: (correct: boolean, score?: number) => void
}

type Speed = 'normal' | 'slow'

const RATES: Record<Speed, number> = { normal: 0.85, slow: 0.6 }

export default function ListenRepeatMission({ content, onAnswer }: Props) {
  const { phrase_en, phrase_pt, audio_url, phonetic } =
    content as unknown as Content

  const [played,   setPlayed]   = useState(false)
  const [loading,  setLoading]  = useState<Speed | null>(null)
  const [revealed, setRevealed] = useState(false)

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

  return (
    <div className="space-y-5">
      {/* Card com frase e botões de áudio */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
        {/* Frase — aparece após primeira escuta */}
        {played ? (
          <div className="mb-5 space-y-1">
            <p className="text-xl font-bold text-gray-900">{phrase_en}</p>
            {phonetic && (
              <p className="text-gray-400 text-sm italic">{phonetic}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm mb-5">
            Ouça o áudio para ver a frase
          </p>
        )}

        {/* Botões de velocidade */}
        <div className="flex gap-3 justify-center">
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
      </div>

      {/* Tradução */}
      {played && (
        <button
          onClick={() => setRevealed(true)}
          className="w-full text-center text-brand-blue text-sm underline"
        >
          {revealed ? phrase_pt : 'Ver tradução'}
        </button>
      )}

      {/* Instrução para repetir */}
      {played && (
        <div className="bg-brand-sand rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm font-medium">Agora repita em voz alta:</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{phrase_en}</p>
        </div>
      )}

      {/* Confirmação manual */}
      {played && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onAnswer(false, 50)}
            className="py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-medium
                       text-sm hover:border-red-300 hover:text-red-500 transition-colors"
          >
            Preciso praticar
          </button>
          <button
            onClick={() => onAnswer(true, 100)}
            className="py-3 rounded-xl bg-brand-green text-white font-semibold text-sm
                       hover:bg-brand-green-dark transition-colors"
          >
            Consegui! ✓
          </button>
        </div>
      )}

      {!played && (
        <p className="text-center text-gray-400 text-sm">
          Ouça o áudio primeiro para continuar
        </p>
      )}
    </div>
  )
}
