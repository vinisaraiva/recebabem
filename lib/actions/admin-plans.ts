/**
 * Server Actions para gestão de plan_tracks.
 */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function togglePlanTrack(
  planId:  string,
  trackId: string,
  active:  boolean,
) {
  const supabase = await createClient()
  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false }

  if (active) {
    const { error } = await supabase
      .from('plan_tracks')
      .insert({ plan_id: planId, track_id: trackId })
    if (error) return { success: false }
  } else {
    const { error } = await supabase
      .from('plan_tracks')
      .delete()
      .eq('plan_id', planId)
      .eq('track_id', trackId)
    if (error) return { success: false }
  }

  revalidatePath('/admin/planos')
  return { success: true }
}
