/**
 * Formulário para adicionar missão de quiz ou fill_blank diretamente no admin.
 * Tipos mais complexos (simulation, match_pairs) podem ser adicionados via SQL/seed.
 */
'use client'

import { useState } from 'react'
import { Plus, ChevronDown, Loader2 } from 'lucide-react'
import { createMission } from '@/lib/actions/admin-content'
import { MISSION_TYPES } from '@/lib/constants'
import MissionImageUpload from './MissionImageUpload'

interface Props {
  moduleId:       string
  nextOrderIndex: number
}

export default function AddMissionForm({ moduleId, nextOrderIndex }: Props) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name,         setName]         = useState('')
  const [type,         setType]         = useState('quiz')
  const [points,       setPoints]       = useState(10)
  const [imageUrl,     setImageUrl]     = useState('')
  const [question,     setQuestion]     = useState('')
  const [options,      setOptions]      = useState(['', '', '', ''])
  const [correctIdx,   setCorrectIdx]   = useState(0)
  const [explanation,  setExplanation]  = useState('')

  // Para fill_blank
  const [sentence,     setSentence]     = useState('')
  const [answer,       setAnswer]       = useState('')
  const [hint,         setHint]         = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let content: Record<string, unknown> = {}

    // image_url opcional — adicionado a qualquer tipo se preenchido
    const imageField = imageUrl ? { image_url: imageUrl } : {}

    if (type === 'quiz') {
      content = {
        question,
        explanation,
        options: options.map((text, idx) => ({
          text,
          correct: idx === correctIdx,
        })),
        ...imageField,
      }
    } else if (type === 'fill_blank') {
      content = { sentence, answer, hint, explanation, ...imageField }
    }

    const result = await createMission({
      moduleId,
      name,
      type,
      pointsReward: points,
      content,
      orderIndex:   nextOrderIndex,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setOpen(false); resetForm() }, 1500)
    } else {
      setError(result.error ?? 'Erro ao criar missão.')
    }
    setLoading(false)
  }

  function resetForm() {
    setName(''); setQuestion(''); setOptions(['', '', '', '']); setCorrectIdx(0)
    setSentence(''); setAnswer(''); setHint(''); setExplanation(''); setImageUrl('')
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-brand-blue text-sm font-medium hover:underline"
      >
        <Plus size={16} />
        Adicionar missão
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="input text-sm" placeholder="Nome da missão" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} className="input text-sm">
                {MISSION_TYPES.filter(t => ['quiz', 'fill_blank'].includes(t.value)).map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Pontos</label>
            <input type="number" min={5} max={50} value={points} onChange={e => setPoints(Number(e.target.value))} className="input text-sm w-24" />
          </div>

          {type === 'quiz' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pergunta</label>
                <textarea required value={question} onChange={e => setQuestion(e.target.value)} className="input text-sm resize-none" rows={2} placeholder="Qual é a frase correta...?" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700">Opções (marque a correta)</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={correctIdx === i} onChange={() => setCorrectIdx(i)} className="accent-brand-green" />
                    <input value={opt} onChange={e => setOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))} className="input text-sm flex-1" placeholder={`Opção ${String.fromCharCode(65 + i)}`} required />
                  </div>
                ))}
              </div>
            </>
          )}

          {type === 'fill_blank' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Sentença (use _____ para a lacuna)</label>
                <input required value={sentence} onChange={e => setSentence(e.target.value)} className="input text-sm" placeholder="The guest wants to _____ in." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Resposta correta</label>
                  <input required value={answer} onChange={e => setAnswer(e.target.value)} className="input text-sm" placeholder="check" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dica (opcional)</label>
                  <input value={hint} onChange={e => setHint(e.target.value)} className="input text-sm" placeholder="Dica..." />
                </div>
              </div>
            </>
          )}

          <MissionImageUpload
            moduleId={moduleId}
            value={imageUrl}
            onChange={setImageUrl}
          />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Explicação (opcional)</label>
            <input value={explanation} onChange={e => setExplanation(e.target.value)} className="input text-sm" placeholder="Por que esta é a resposta correta..." />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          {success ? (
            <p className="text-brand-green text-sm font-medium">✅ Missão criada!</p>
          ) : (
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Salvando…' : 'Criar Missão'}
            </button>
          )}
        </form>
      )}
    </div>
  )
}
