/**
 * Página de missão — carrega dados e delega ao MissionPlayer (client).
 * Recebe `fila` e `total` via searchParams para gerenciar sessão sequencial.
 */
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import MissionPlayer from './MissionPlayer'

interface Props {
  params:       Promise<{ slug: string; modSlug: string; missionId: string }>
  searchParams: Promise<{ fila?: string; total?: string; desafio?: string }>
}

export default async function MissaoPage({ params, searchParams }: Props) {
  const { slug, modSlug, missionId }      = await params
  const { fila = '', total = '0', desafio } = await searchParams
  const isDesafio = desafio === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: mission } = await supabase
    .from('missions')
    .select('id, name, type, content, points_reward, module_id')
    .eq('id', missionId)
    .single()
  if (!mission) notFound()

  const { data: progress } = await supabase
    .from('mission_progress')
    .select('status, score, attempts')
    .eq('profile_id', user.id)
    .eq('mission_id', missionId)
    .maybeSingle()

  return (
    <MissionPlayer
      mission={mission}
      existingProgress={progress}
      userId={user.id}
      backHref={`/trilhas/${slug}/modulos/${modSlug}`}
      fila={fila}
      total={parseInt(total, 10)}
      isDesafio={isDesafio}
    />
  )
}
