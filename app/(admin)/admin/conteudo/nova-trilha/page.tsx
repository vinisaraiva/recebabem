/**
 * Criar nova trilha de conteúdo — /admin/conteudo/nova-trilha
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { createTrack } from '@/lib/actions/admin-content'

const LEVELS = [
  { value: 'beginner',     label: 'Iniciante' },
  { value: 'intermediate', label: 'Intermediário' },
  { value: 'advanced',     label: 'Avançado' },
]

const ICON_SUGGESTIONS = ['📚', '🎧', '🏨', '🗣️', '✈️', '🍽️', '🎭', '🏆', '💬', '🌐']

export default function NovaTrilhaPage() {
  const router = useRouter()

  const [name,        setName]        = useState('')
  const [icon,        setIcon]        = useState('📚')
  const [level,       setLevel]       = useState('beginner')
  const [description, setDescription] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createTrack({ name, icon, level, description })

    if (result.success) {
      router.push('/admin/conteudo')
      router.refresh()
    } else {
      setError(result.error ?? 'Erro ao criar trilha.')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <Link
        href="/admin/conteudo"
        className="flex items-center gap-1 text-gray-400 text-sm mb-5 hover:text-gray-600"
      >
        <ChevronLeft size={16} /> Conteúdo
      </Link>

      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
        <BookOpen size={20} className="text-brand-blue" />
        Nova Trilha
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da trilha *
          </label>
          <input
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
            placeholder="Ex: Inglês para Recepção"
            maxLength={100}
          />
        </div>

        {/* Ícone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ícone (emoji)
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {ICON_SUGGESTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`text-2xl w-10 h-10 rounded-xl border-2 transition-all flex items-center justify-center ${
                  icon === emoji
                    ? 'border-brand-blue bg-brand-blue/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {emoji}
              </button>
            ))}
            <input
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="input w-20 text-center text-lg"
              placeholder="outro"
              maxLength={4}
            />
          </div>
        </div>

        {/* Nível */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nível
          </label>
          <div className="flex gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  level === l.value
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="input resize-none"
            rows={3}
            placeholder="Descreva o objetivo desta trilha..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/500</p>
        </div>

        <p className="text-xs text-gray-400">
          A trilha será criada como <strong>inativa</strong> — ative-a após adicionar módulos e missões.
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <Link href="/admin/conteudo" className="btn-outline flex-1 text-center">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Criando…' : 'Criar Trilha'}
          </button>
        </div>
      </form>
    </div>
  )
}
