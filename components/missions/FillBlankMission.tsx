/**
 * Preencher lacuna — digita a palavra correta em inglês.
 * Conteúdo: { sentence, answer, hint?, explanation? }
 * Ex: sentence = "The guest wants to _____ in at 3pm.", answer = "check"
 */
'use client'

import { useState, useRef } from 'react'

interface Content {
  sentence:     string
  answer:       string
  hint?:        string
  explanation?: string
}

interface Props {
  content:  Record<string, unknown>
  onAnswer: (correct: boolean, score?: number) => void
}

type Result = 'idle' | 'correct' | 'wrong'

export default function FillBlankMission({ content, onAnswer }: Props) {
  const { sentence, answer, hint } = content as unknown as Content
  const [value,  setValue]  = useState('')
  const [result, setResult] = useState<Result>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  const parts = sentence.split('_____')

  function handleSubmit() {
    if (!value.trim() || result !== 'idle') return

    const correct = value.trim().toLowerCase() === answer.toLowerCase()
    setResult(correct ? 'correct' : 'wrong')

    // Dá tempo do usuário ver o feedback no botão antes do MissionPlayer tomar conta
    setTimeout(() => onAnswer(correct, 100), 1400)
  }

  return (
    <div className="space-y-5">
      {/* Sentença com campo inline */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <p className="text-gray-800 text-base leading-loose">
          {parts[0]}
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={result !== 'idle'}
            placeholder="…"
            className={`
              inline-block border-b-2 outline-none px-1 text-center font-bold
              w-28 mx-1 transition-colors duration-200
              ${result === 'correct' ? 'border-brand-green text-brand-green'
              : result === 'wrong'   ? 'border-red-400 text-red-500'
              : 'border-brand-blue text-brand-blue focus:border-brand-green'}
            `}
            autoFocus
          />
          {parts[1]}
        </p>
      </div>

      {/* Dica — some após responder */}
      {hint && result === 'idle' && (
        <p className="text-gray-400 text-xs text-center">💡 Dica: {hint}</p>
      )}

      {/* Resposta correta revelada quando errou */}
      {result === 'wrong' && (
        <p className="text-center text-sm">
          Resposta correta:{' '}
          <span className="font-bold text-brand-green">{answer}</span>
        </p>
      )}

      {/* Botão — muda cor e texto conforme resultado */}
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || result !== 'idle'}
        className={`
          w-full py-3.5 rounded-2xl font-semibold text-white text-sm
          transition-all duration-200 active:scale-95
          ${result === 'correct'
            ? 'bg-brand-green'
            : result === 'wrong'
            ? 'bg-red-500'
            : 'bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-40'}
        `}
      >
        {result === 'correct' && '✓ Correto!'}
        {result === 'wrong'   && '✗ Resposta errada'}
        {result === 'idle'    && 'Confirmar'}
      </button>
    </div>
  )
}
