/**
 * Quiz — múltipla escolha.
 * Conteúdo esperado: { question, options: [{text, correct}], explanation? }
 */
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface Option { text: string; correct: boolean }
interface Content { question: string; options: Option[]; explanation?: string }
interface Props {
  content:  Record<string, unknown>
  onAnswer: (correct: boolean, score?: number) => void
}

export default function QuizMission({ content, onAnswer }: Props) {
  const { question, options } = content as unknown as Content

  // Embaralha opções no mount — impede cópia de gabaritos entre funcionários
  const [shuffled] = useState<Option[]>(
    () => [...options].sort(() => Math.random() - 0.5)
  )
  const [selected, setSelected] = useState<number | null>(null)

  function handleSelect(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => onAnswer(shuffled[idx].correct, 100), 600)
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-800 font-medium text-base leading-relaxed">
        {question}
      </p>

      <div className="space-y-2 mt-4">
        {shuffled.map((opt, idx) => {
          const isSelected = selected === idx
          const isCorrect  = opt.correct   // viaja com a opção após shuffle
          const showResult = selected !== null

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border-2 font-medium text-sm',
                'transition-all duration-200 active:scale-98',
                !showResult && 'border-gray-200 bg-white hover:border-brand-blue hover:bg-brand-blue/5',
                showResult && isSelected && isCorrect  && 'border-brand-green bg-green-50 text-brand-green',
                showResult && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-600',
                showResult && !isSelected && isCorrect && 'border-brand-green/50 bg-green-50/50 text-brand-green',
                showResult && !isSelected && !isCorrect && 'border-gray-100 bg-gray-50 text-gray-400',
              )}
            >
              <span className="mr-2">
                {showResult && isCorrect ? '✓' : showResult && isSelected ? '✗' : String.fromCharCode(65 + idx) + '.'}
              </span>
              {opt.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
