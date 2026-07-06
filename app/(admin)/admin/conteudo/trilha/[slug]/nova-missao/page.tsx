/**
 * Seletor de módulo para nova missão — /admin/conteudo/trilha/[slug]/nova-missao
 * Lista os módulos da trilha e direciona ao detalhe do módulo onde está o AddMissionForm.
 */
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import Link from 'next/link'

interface Props { params: Promise<{ slug: string }> }

export default async function NovaMissaoPage({ params }: Props) {
  const { slug } = await params
  const supabase  = await createClient()

  type TrackRow = {
    id:   string
    name: string
    icon: string | null
    modules: Array<{ id: string; name: string; active: boolean; order_index: number }>
  }

  const { data: track } = await supabase
    .from('tracks')
    .select('id, name, icon, modules(id, name, active, order_index)')
    .eq('slug', slug)
    .single() as { data: TrackRow | null }

  if (!track) notFound()

  const modules = (track.modules ?? []).sort((a, b) => a.order_index - b.order_index)

  // Trilha com módulo único → redireciona direto
  if (modules.length === 1) {
    redirect(`/admin/conteudo/modulo/${modules[0].id}`)
  }

  return (
    <div className="p-6 max-w-xl">
      <Link
        href="/admin/conteudo"
        className="flex items-center gap-1 text-gray-400 text-sm mb-5 hover:text-gray-600"
      >
        <ChevronLeft size={16} /> Conteúdo
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{track.icon ?? '📚'}</span>
        <div>
          <p className="text-xs text-gray-400">Nova missão em</p>
          <h1 className="text-xl font-bold text-gray-900">{track.name}</h1>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="card text-center py-10">
          <Layers size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Esta trilha ainda não tem módulos.</p>
          <p className="text-gray-400 text-xs mt-1">
            Adicione módulos via banco de dados antes de criar missões.
          </p>
          <Link href="/admin/conteudo" className="text-brand-blue text-sm font-medium mt-4 inline-block">
            Voltar ao conteúdo
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Escolha em qual módulo adicionar a missão:
          </p>
          <div className="space-y-2">
            {modules.map((mod) => (
              <Link
                key={mod.id}
                href={`/admin/conteudo/modulo/${mod.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{mod.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    mod.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {mod.active ? 'ativo' : 'inativo'}
                  </span>
                </div>
                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
