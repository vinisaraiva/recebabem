/**
 * Caça-par — conecta PT com EN clicando nos dois lados.
 * Conteúdo: { pairs: [{pt, en}] }
 */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface Pair { pt: string; en: string }
interface Content { pairs: Pair[] }
interface Props {
  content:  Record<string, unknown>
  onAnswer: (correct: boolean, score?: number) => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function MatchPairsMission({ content, onAnswer }: Props) {
  const { pairs } = content as unknown as Content

  const [ptWords,   setPtWords]   = useState<string[]>([])
  const [enWords,   setEnWords]   = useState<string[]>([])
  const [selectedPt, setSelectedPt] = useState<string | null>(null)
  const [selectedEn, setSelectedEn] = useState<string | null>(null)
  const [matched,    setMatched]    = useState<Set<string>>(new Set())
  const [wrong,      setWrong]      = useState<Set<string>>(new Set())

  useEffect(() => {
    setPtWords(shuffle(pairs.map((p) => p.pt)))
    setEnWords(shuffle(pairs.map((p) => p.en)))
  }, [])

  // Ao selecionar um par PT + EN, verifica se combinam
  useEffect(() => {
    if (!selectedPt || !selectedEn) return

    const correct = pairs.some((p) => p.pt === selectedPt && p.en === selectedEn)

    if (correct) {
      const next = new Set(matched)
      next.add(selectedPt)
      next.add(selectedEn)
      setMatched(next)

      // Verifica se completou tudo
      if (next.size === pairs.length * 2) {
        setTimeout(() => onAnswer(true, 100), 400)
      }
    } else {
      const fail = new Set([selectedPt, selectedEn])
      setWrong(fail)
      setTimeout(() => setWrong(new Set()), 800)
    }

    setSelectedPt(null)
    setSelectedEn(null)
  }, [selectedPt, selectedEn])

  function wordStyle(word: string, side: 'pt' | 'en') {
    if (matched.has(word))    return 'bg-brand-green/10 border-brand-green text-brand-green line-through'
    if (wrong.has(word))      return 'bg-red-50 border-red-400 text-red-600 animate-pulse'
    const isSelected = side === 'pt' ? selectedPt === word : selectedEn === word
    if (isSelected)           return 'bg-brand-blue text-white border-brand-blue'
    return 'bg-white border-gray-200 text-gray-800 hover:border-brand-blue hover:bg-brand-blue/5'
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-500 text-sm text-center">
        Conecte as palavras em português com o inglês
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Coluna PT */}
        <div className="space-y-2">
          {ptWords.map((word) => (
            <button
              key={word}
              onClick={() => !matched.has(word) && setSelectedPt(word)}
              disabled={matched.has(word)}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                wordStyle(word, 'pt')
              )}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Coluna EN */}
        <div className="space-y-2">
          {enWords.map((word) => (
            <button
              key={word}
              onClick={() => !matched.has(word) && setSelectedEn(word)}
              disabled={matched.has(word)}
              className={cn(
                'w-full px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                wordStyle(word, 'en')
              )}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        {matched.size / 2} / {pairs.length} pares encontrados
      </p>
    </div>
  )
}
