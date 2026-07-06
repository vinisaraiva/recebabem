/**
 * Server Actions para missões — registra conclusão e concede pontos.
 */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CompleteMissionArgs {
  missionId: string
  score:     number
  correct:   boolean
}

export async function completeMission({ missionId, score, correct }: CompleteMissionArgs) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  // Busca a missão para saber o points_reward e module_id
  const { data: mission } = await supabase
    .from('missions')
    .select('points_reward, module_id, modules(track_id)')
    .eq('id', missionId)
    .single()

  if (!mission) return { success: false }

  const hotelId = await getHotelId(supabase)

  // Upsert atômico — incrementa attempts corretamente via função SQL
  await supabase.rpc('upsert_mission_progress', {
    p_profile_id:   user.id,
    p_mission_id:   missionId,
    p_status:       correct ? 'completed' : 'attempted',
    p_score:        correct ? score : 0,
    p_completed_at: correct ? new Date().toISOString() : null,
  })

  // Se acertou: concede pontos e registra atividade
  if (correct && hotelId) {
    // Pontos — upsert idempotente: double-click ou retry não duplica pontos
    await supabase.from('points_ledger').upsert(
      {
        profile_id: user.id,
        hotel_id:   hotelId,
        mission_id: missionId,
        amount:     mission.points_reward,
        reason:     'mission_completed',
      },
      {
        onConflict:       'profile_id,mission_id,reason',
        ignoreDuplicates: true,
      }
    )

    // Atividade do dia (para streak) — acumula missões e pontos via função SQL
    const today = new Date().toISOString().slice(0, 10)
    await supabase.rpc('upsert_activity_log', {
      p_profile_id:         user.id,
      p_hotel_id:           hotelId,
      p_activity_date:      today,
      p_missions_completed: 1,
      p_points_earned:      mission.points_reward,
    })
  }

  revalidatePath('/inicio')
  revalidatePath('/trilhas')

  return { success: true }
}

/** Helper — busca hotel_id do usuário via RPC. */
async function getHotelId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.rpc('get_my_hotel_id')
  return data as string | null
}
