/**
 * OnboardingFlow — slides fullscreen mostrados apenas na 1ª abertura.
 * Controle via localStorage: chave 'recebabem_onboarding_done'.
 * Último slide é a tela "Sobre" — botão "Começar" fecha e salva flag.
 */
'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Trophy, Zap, GraduationCap, ChevronRight } from 'lucide-react'

const STORAGE_KEY = 'recebabem_onboarding_done'

interface Slide {
  icon:        React.ReactNode
  title:       string
  description: string
  bg:          string
  iconBg:      string
}

const SLIDES: Slide[] = [
  {
    icon:        <BookOpen size={48} strokeWidth={1.5} />,
    title:       'Bem-vindo ao RecebaBem',
    description: 'Seu treinamento de inglês para hotelaria. Aprenda no seu ritmo, quando e onde quiser.',
    bg:          'from-brand-blue-dark to-brand-blue',
    iconBg:      'bg-white/15',
  },
  {
    icon:        <span className="text-5xl leading-none">🗺️</span>,
    title:       'Trilhas de Aprendizado',
    description: 'Cada trilha tem módulos com missões interativas: ouça, repita, complete e simule situações reais do hotel.',
    bg:          'from-teal-700 to-teal-500',
    iconBg:      'bg-white/15',
  },
  {
    icon:        <Trophy size={48} strokeWidth={1.5} />,
    title:       'Pontos, Streak e Conquistas',
    description: 'Ganhe pontos a cada missão, mantenha seu streak diário e desbloqueie conquistas. Quanto mais consistente, mais rápido você avança.',
    bg:          'from-amber-600 to-amber-400',
    iconBg:      'bg-white/15',
  },
  {
    icon:        <GraduationCap size={48} strokeWidth={1.5} />,
    title:       'Sobre o RecebaBem',
    description: 'Desenvolvido por uma equipe de mestres e doutores especializados em ensino de inglês para hotelaria. Metodologia baseada em situações reais do setor.',
    bg:          'from-brand-green-dark to-brand-green',
    iconBg:      'bg-white/15',
  },
]

export default function OnboardingFlow() {
  const [show,    setShow]    = useState(false)
  const [current, setCurrent] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Só mostra se nunca viu antes
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true)
    }
  }, [])

  function next() {
    if (current < SLIDES.length - 1) {
      setCurrent((c) => c + 1)
    } else {
      finish()
    }
  }

  function finish() {
    setExiting(true)
    localStorage.setItem(STORAGE_KEY, '1')
    setTimeout(() => setShow(false), 350)
  }

  if (!show) return null

  const slide     = SLIDES[current]
  const isLast    = current === SLIDES.length - 1

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col transition-opacity duration-350
        ${exiting ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Fundo gradiente */}
      <div className={`absolute inset-0 bg-gradient-to-b ${slide.bg} transition-all duration-500`} />

      {/* Conteúdo */}
      <div className="relative flex flex-col flex-1 max-w-md mx-auto w-full px-8 py-12">

        {/* Skip — exceto no último */}
        {!isLast && (
          <button
            onClick={finish}
            className="self-end text-white/60 text-sm font-medium hover:text-white transition-colors mb-8"
          >
            Pular
          </button>
        )}
        {isLast && <div className="mb-8 h-5" />}

        {/* Ilustração */}
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-8">
          <div className={`w-28 h-28 rounded-full ${slide.iconBg} flex items-center justify-center text-white`}>
            {slide.icon}
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white leading-tight">
              {slide.title}
            </h1>
            <p className="text-white/85 text-base leading-relaxed">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Indicadores de página */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Botão de avançar */}
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl bg-white font-bold text-base
                     flex items-center justify-center gap-2 active:scale-95
                     transition-all duration-150 shadow-lg"
          style={{ color: 'var(--color-brand-blue-dark, #1e3a5f)' }}
        >
          {isLast ? 'Começar agora' : (
            <>Próximo <ChevronRight size={18} /></>
          )}
        </button>

      </div>
    </div>
  )
}
