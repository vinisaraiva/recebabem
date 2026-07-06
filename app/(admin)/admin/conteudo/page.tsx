/**
 * Gestão de conteúdo — /admin/conteudo
 * Lista trilhas → módulos → missões. Super_admin pode ativar/desativar e criar.
 */
import { createClient } from '@/lib/supabase/server'
import { BookOpen, ChevronRight, ToggleLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import ToggleActiveButton from '@/components/admin/ToggleActiveButton'

export const metadata = { title: 'Conteúdo' }

export default async function ConteudoPage() {
  const supabase = await createClient()

  // Carrega trilhas com seus módulos e contagem de missões
  const { data: tracks } = await supabase
    .from('tracks')
    .select(`
      id, name, slug, icon, color, active, level,
      modules (
        id, name, slug, active, order_index,
        missions ( count )
      )
    `)
    .order('order_index')

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen size={24} className="text-brand-blue" />
          Conteúdo
        </h1>
        <Link
          href="/admin/conteudo/nova-trilha"
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Nova Trilha
        </Link>
      </div>

      <div className="space-y-4">
        {(tracks ?? []).map((track) => {
          const modules      = (track.modules as unknown as Array<{
            id: string; name: string; slug: string; active: boolean; order_index: number;
            missions: Array<{ count: number }>
          }>) ?? []
          const totalMissions = modules.reduce((sum, m) => sum + (m.missions?.[0]?.count ?? 0), 0)

          return (
            <div key={track.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Header da trilha */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                <span className="text-2xl">{track.icon ?? '📚'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{track.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">
                      {track.level}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      track.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {track.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {modules.length} módulos · {totalMissions} missões
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ToggleActiveButton
                    table="tracks"
                    id={track.id}
                    active={track.active}
                  />
                  <Link
                    href={`/admin/conteudo/trilha/${track.slug}/nova-missao`}
                    className="text-xs text-brand-blue hover:underline"
                  >
                    + missão
                  </Link>
                </div>
              </div>

              {/* Módulos */}
              <div className="divide-y divide-gray-50">
                {modules
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((mod) => {
                    const missionCount = mod.missions?.[0]?.count ?? 0
                    return (
                      <div key={mod.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 ml-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{mod.name}</p>
                          <p className="text-xs text-gray-400">{missionCount} missão{missionCount !== 1 ? 'ões' : ''}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            mod.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {mod.active ? 'ativo' : 'inativo'}
                          </span>
                          <ToggleActiveButton
                            table="modules"
                            id={mod.id}
                            active={mod.active}
                            small
                          />
                          <Link
                            href={`/admin/conteudo/modulo/${mod.id}`}
                            className="text-gray-400 hover:text-brand-blue"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
