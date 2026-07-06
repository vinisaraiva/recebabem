/**
 * Simulação — diálogo hotel real. Usuário vê o contexto e escolhe a resposta certa.
 * Conteúdo: { scenario, dialog: [{role, text}], question, options: [{text, correct}] }
 */
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface DialogLine { role: 'guest' | 'staff'; text: string }
interface Option     { text: string; correct: boolean }
interface Content {
  scenario:    string
  dialog:      DialogLine[]
  question:    string
  options:     Option[]
  explanation?: string
}

interface Props {
  content:  Record<string, unknown>
  onAnswer: (correct: boolean, score?: number) => void
}

export default function SimulationMission({ content, onAnswer }: Props) {
  const { scenario, dialog, question, options } = content as unknown as Content

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
    <div className="space-y-4">
      {/* Contexto / cenário */}
      <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl px-4 py-3">
        <p className="text-brand-blue text-xs font-semibold uppercase tracking-wide mb-0.5">Situação</p>
        <p className="text-gray-700 text-sm">{scenario}</p>
      </div>

      {/* Diálogo */}
      <div className="space-y-2">
        {dialog.map((line, idx) => (
          <div
            key={idx}
            className={cn(
              'flex gap-2',
              line.role === 'staff' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0',
              line.role === 'guest' ? 'bg-gray-100' : 'bg-brand-green/20'
            )}>
              {line.role === 'guest' ? '👤' : '👷'}
            </div>
            <div className={cn(
              'max-w-[75%] px-3 py-2 rounded-2xl text-sm',
              line.role === 'guest'
                ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                : 'bg-brand-green/10 text-gray-800 rounded-tr-sm'
            )}>
              {line.text}
            </div>
          </div>
        ))}
      </div>

      {/* Pergunta */}
      <p className="font-semibold text-gray-900 text-sm mt-2">{question}</p>

      {/* Opções */}
      <div className="space-y-2">
        {shuffled.map((opt, idx) => {
          const isSelected  = selected === idx
          const isCorrect   = opt.correct   // viaja com a opção após shuffle
          const showResult  = selected !== null

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all',
                !showResult && 'border-gray-200 bg-white hover:border-brand-blue',
                showResult && isSelected && isCorrect  && 'border-brand-green bg-green-50 text-brand-green',
                showResult && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-600',
                showResult && !isSelected && isCorrect && 'border-brand-green/40 bg-green-50/50 text-brand-green',
                showResult && !isSelected && !isCorrect && 'border-gray-100 bg-gray-50 text-gray-400',
              )}
            >
              {opt.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
