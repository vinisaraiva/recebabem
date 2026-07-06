/**
 * Detalhe do módulo no admin — lista e gerencia as missões.
 * /admin/conteudo/modulo/[moduleId]
 */
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import ToggleActiveButton from '@/components/admin/ToggleActiveButton'
import AddMissionForm from '@/components/admin/AddMissionForm'

interface Props { params: Promise<{ moduleId: string }> }

const TYPE_LABELS: Record<string, string> = {
  listen_repeat:   '🎧 Ouvir/Repetir',
  listen_identify: '🎧 Ouça/Identifique',
  quiz:            '❓ Quiz',
  simulation:      '🎭 Simulação',
  match_pairs:     '🃏 Caça-par',
  fill_blank:      '✏️ Lacuna',
  word_order:      '🔤 Ordenar',
}

export default async function AdminModuloPage({ params }: Props) {
  const { moduleId } = await params
  const supabase     = await createClient()

  type ModuleRow = {
    id: string
    name: string
    slug: string
    active: boolean
    track_id: string
    tracks: { name: string; slug: string } | null
  }
  const { data: module } = await supabase
    .from('modules')
    .select('id, name, slug, active, track_id, tracks(name, slug)')
    .eq('id', moduleId)
    .single() as { data: ModuleRow | null }

  if (!module) notFound()

  type MissionRow = {
    id: string
    name: string
    type: string
    points_reward: number
    active: boolean
    order_index: number
  }
  const { data: missions } = await supabase
    .from('missions')
    .select('id, name, type, points_reward, active, order_index')
    .eq('module_id', moduleId)
    .order('order_index') as { data: MissionRow[] | null }

  const track = module.tracks

  return (
    <div className="p-6 max-w-3xl">
      <Link
        href="/admin/conteudo"
        className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-gray-600"
      >
        <ChevronLeft size={16} /> Conteúdo
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{track?.name}</p>
          <h1 className="text-xl font-bold text-gray-900">{module.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {(missions ?? []).length} missão{(missions ?? []).length !== 1 ? 'ões' : ''}
          </p>
        </div>
        <ToggleActiveButton table="modules" id={module.id} active={module.active} />
      </div>

      {/* Lista de missões */}
      <div className="space-y-2 mb-8">
        {(missions ?? []).map((mission) => (
          <div key={mission.id} className="card flex items-center gap-3">
            <span className="text-lg">{TYPE_LABELS[mission.type]?.slice(0, 2) ?? '📖'}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{mission.name}</p>
              <p className="text-xs text-gray-400">
                {TYPE_LABELS[mission.type] ?? mission.type} · {mission.points_reward} pts
              </p>
            </div>
            <ToggleActiveButton table="missions" id={mission.id} active={mission.active} small />
          </div>
        ))}

        {(missions ?? []).length === 0 && (
          <div className="card text-center py-8 text-gray-400 text-sm">
            Nenhuma missão neste módulo ainda.
          </div>
        )}
      </div>

      {/* Formulário para adicionar missão simples (quiz/fill_blank) */}
      <AddMissionForm
        moduleId={moduleId}
        nextOrderIndex={(missions ?? []).length + 1}
      />
    </div>
  )
}
