'use server'
/**
 * Desafio do Dia — lógica personalizada por funcionário.
 * Pega a próxima missão não concluída da trilha ativa do usuário
 * e oferece 2× pontos se concluída no dia corrente.
 */
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DailyChallenge {
  mission: {
    id:            string
    name:          string
    type:          string
    points_reward: number
  }
  track:      { slug: string; name: string; icon: string | null }
  moduleSlug: string
  bonusPoints: number        // pontos extras (igual ao reward = 2× total)
  alreadyClaimed: boolean    // bônus do dia já recebido
}

/**
 * Retorna o desafio personalizado do dia para o funcionário logado.
 * Lógica: próxima missão não concluída na trilha em progresso mais recente.
 * Retorna null se não houver trilha ativa ou todas as missões estiverem concluídas.
 */
export async function getDailyChallenge(): Promise<DailyChallenge | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Trilha mais recente em progresso (não concluída)
  const { data: activeTp } = await supabase
    .from('track_progress')
    .select('tracks(id, slug, name, icon)')
    .eq('profile_id', user.id)
    .lt('completion_pct', 100)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!activeTp) return null
  const track = activeTp.tracks as { id: string; slug: string; name: string; icon: string | null } | null
  if (!track) return null

  // 2. Missões da trilha, ordenadas por módulo e por missão
  const { data: missions } = await supabase
    .from('missions')
    .select(`
      id, name, type, points_reward, order_index,
      modules!inner(id, slug, order_index, track_id, active)
    `)
    .eq('modules.track_id', track.id)
    .eq('modules.active', true)
    .eq('active', true)
    .order('order_index', { referencedTable: 'modules', ascending: true })
    .order('order_index', { ascending: true })

  if (!missions || missions.length === 0) return null

  // 3. Missões já concluídas pelo funcionário
  const missionIds = missions.map((m) => m.id)
  const { data: completed } = await supabase
    .from('mission_progress')
    .select('mission_id')
    .eq('profile_id', user.id)
    .eq('status', 'completed')
    .in('mission_id', missionIds)

  const completedSet = new Set((completed ?? []).map((p) => p.mission_id))
  const next = missions.find((m) => !completedSet.has(m.id))
  if (!next) return null

  const mod = next.modules as { id: string; slug: string; order_index: number } | null
  if (!mod) return null

  // 4. Verifica se o bônus de hoje já foi recebido
  const today = new Date().toISOString().split('T')[0]
  const { data: todayCompletion } = await supabase
    .from('daily_challenge_completions')
    .select('id')
    .eq('profile_id', user.id)
    .eq('challenge_date', today)
    .maybeSingle()

  return {
    mission: {
      id:            next.id,
      name:          next.name,
      type:          next.type,
      points_reward: next.points_reward,
    },
    track:       { slug: track.slug, name: track.name, icon: track.icon },
    moduleSlug:  mod.slug,
    bonusPoints: next.points_reward,   // bônus = mesmo valor → total 2×
    alreadyClaimed: !!todayCompletion,
  }
}

/**
 * Credita o bônus 2× ao concluir o Desafio do Dia.
 * Segurança:
 *  - verifica que a missão está realmente concluída no mission_progress
 *  - UNIQUE (profile_id, challenge_date) impede double-claim
 */
export async function claimDailyBonus(missionId: string): Promise<{ success: boolean; bonusPoints?: number; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  // Garante que a missão foi concluída
  const { data: progress } = await supabase
    .from('mission_progress')
    .select('status')
    .eq('profile_id', user.id)
    .eq('mission_id', missionId)
    .maybeSingle()

  if (progress?.status !== 'completed') {
    return { success: false, error: 'Missão não concluída' }
  }

  // Hotel do funcionário
  const { data: hotelId } = await supabase.rpc('get_my_hotel_id')
  if (!hotelId) return { success: false, error: 'Hotel não encontrado' }

  // Pontos da missão
  const { data: mission } = await supabase
    .from('missions')
    .select('points_reward')
    .eq('id', missionId)
    .single()
  if (!mission) return { success: false, error: 'Missão não encontrada' }

  const bonusPoints = mission.points_reward
  const today = new Date().toISOString().split('T')[0]

  // Registra a conclusão — UNIQUE (profile_id, challenge_date) bloqueia double-claim
  const { error: insertError } = await supabase
    .from('daily_challenge_completions')
    .insert({
      profile_id:     user.id,
      mission_id:     missionId,
      challenge_date: today,
      bonus_points:   bonusPoints,
    })

  if (insertError) {
    // Código 23505 = unique_violation → bônus já recebido hoje
    return { success: false, error: 'Bônus já recebido hoje' }
  }

  // Credita bônus no ledger
  await supabase.from('points_ledger').insert({
    profile_id: user.id,
    hotel_id:   hotelId,
    mission_id: missionId,
    amount:     bonusPoints,
    reason:     'daily_challenge_bonus',
  })

  revalidatePath('/inicio')
  revalidatePath('/ranking')

  return { success: true, bonusPoints }
}
