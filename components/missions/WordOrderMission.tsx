/**
 * Ordenar palavras — arrasta/toca palavras para montar a frase correta.
 * Conteúdo: { words: string[], correct_order: string[], translation?: string }
 */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'

interface Content {
  words:         string[]
  correct_order: string[]
  translation?:  string
}

interface Props {
  content:  Record<string, unknown>
  onAnswer: (correct: boolean, score?: number) => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function WordOrderMission({ content, onAnswer }: Props) {
  const { words, correct_order, translation } = content as unknown as Content

  const [available, setAvailable] = useState<string[]>([])
  const [selected,  setSelected]  = useState<string[]>([])
  const [checked,   setChecked]   = useState(false)

  useEffect(() => {
    setAvailable(shuffle(words))
  }, [])

  function addWord(word: string) {
    setAvailable((a) => a.filter((w) => w !== word))
    setSelected((s) => [...s, word])
  }

  function removeWord(idx: number) {
    const word = selected[idx]
    setSelected((s) => s.filter((_, i) => i !== idx))
    setAvailable((a) => [...a, word])
  }

  function handleCheck() {
    if (selected.length !== correct_order.length) return
    setChecked(true)
    const correct = selected.join(' ') === correct_order.join(' ')
    setTimeout(() => onAnswer(correct, 100), 600)
  }

  const isCorrect = checked && selected.join(' ') === correct_order.join(' ')

  return (
    <div className="space-y-5">
      {translation && (
        <p className="text-gray-500 text-sm text-center italic">"{translation}"</p>
      )}

      {/* Zona de montagem */}
      <div className={cn(
        'min-h-16 bg-white border-2 rounded-2xl p-3 flex flex-wrap gap-2 transition-colors',
        checked ? (isCorrect ? 'border-brand-green' : 'border-red-400') : 'border-dashed border-gray-300'
      )}>
        {selected.length === 0 && (
          <p className="text-gray-300 text-sm w-full text-center pt-2">
            Toque nas palavras abaixo para montar a frase
          </p>
        )}
        {selected.map((word, idx) => (
          <button
            key={idx}
            onClick={() => !checked && removeWord(idx)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all',
              checked
                ? isCorrect ? 'bg-green-50 border-brand-green text-brand-green'
                            : 'bg-red-50 border-red-400 text-red-600'
                : 'bg-brand-blue/10 border-brand-blue text-brand-blue hover:bg-red-50 hover:border-red-300'
            )}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Palavras disponíveis */}
      <div className="flex flex-wrap gap-2 justify-center">
        {available.map((word, idx) => (
          <button
            key={idx}
            onClick={() => !checked && addWord(word)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border-2 border-gray-200 hover:border-brand-blue hover:bg-brand-blue/5 transition-all"
          >
            {word}
          </button>
        ))}
      </div>

      {!checked && (
        <button
          onClick={handleCheck}
          disabled={selected.length !== correct_order.length}
          className="btn-primary w-full disabled:opacity-40"
        >
          Verificar
        </button>
      )}

      {checked && !isCorrect && (
        <p className="text-center text-sm text-gray-500">
          Correto: <span className="font-bold text-brand-green">{correct_order.join(' ')}</span>
        </p>
      )}
    </div>
  )
}
