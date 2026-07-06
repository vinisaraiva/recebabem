/**
 * Tela "Sobre o RecebaBem" — acessível via /perfil.
 * Apresenta a aplicação, metodologia e credenciais da equipe.
 */
import Link from 'next/link'
import { ChevronLeft, GraduationCap, BookOpen, Award } from 'lucide-react'

export const metadata = { title: 'Sobre o RecebaBem' }

export default function SobrePage() {
  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-10">
      {/* Voltar */}
      <Link
        href="/perfil"
        className="flex items-center gap-1 text-gray-400 text-sm mb-5 hover:text-gray-600"
      >
        <ChevronLeft size={16} /> Perfil
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-blue-dark to-brand-blue rounded-3xl px-6 py-8 text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
          <BookOpen size={32} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Receba<span className="text-brand-green-light">Bem</span>
        </h1>
        <p className="text-blue-200 text-sm">
          Inglês para hotelaria
        </p>
      </div>

      {/* Sobre */}
      <div className="card mb-4">
        <h2 className="font-bold text-gray-900 mb-2">O que é o RecebaBem?</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          O RecebaBem é uma plataforma de treinamento em inglês desenvolvida
          especialmente para profissionais da hotelaria. Cada trilha foi construída
          com base em situações reais do setor — recepção, alimentos e bebidas,
          governança e atendimento ao hóspede.
        </p>
      </div>

      {/* Metodologia */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={20} className="text-brand-blue" />
          <h2 className="font-bold text-gray-900">Metodologia</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed mb-3">
          Desenvolvido por uma equipe de mestres e doutores especializados em
          ensino de inglês para hotelaria, o RecebaBem combina:
        </p>
        <ul className="space-y-2">
          {[
            'Aprendizado baseado em contexto real do hotel',
            'Repetição espaçada para fixação do vocabulário',
            'Missões interativas de escuta, leitura e prática oral',
            'Gamificação para manter a consistência diária',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-brand-green font-bold mt-0.5">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Credenciais */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={20} className="text-brand-blue" />
          <h2 className="font-bold text-gray-900">Nossa Equipe</h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          O conteúdo pedagógico do RecebaBem foi elaborado por mestres e doutores
          com experiência em linguística aplicada, ensino de inglês para fins
          específicos (ESP) e gestão hoteleira. Todo o material passa por revisão
          técnica antes de ser disponibilizado na plataforma.
        </p>
      </div>

      {/* Versão */}
      <p className="text-center text-xs text-gray-400 mt-6">
        RecebaBem · v0.1.0
      </p>
    </div>
  )
}
