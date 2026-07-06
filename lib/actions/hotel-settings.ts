/**
 * Server Action para salvar configurações do hotel.
 */
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const settingsSchema = z.object({
  welcomeMessage:       z.string().max(500),
  notificationsEnabled: z.boolean(),
  notificationHour:     z.number().int().min(0).max(23),
  notificationMinute:   z.number().int().min(0).max(59),
  rankingVisible:       z.boolean(),
  activeSectors:        z.array(z.string().max(50)).max(20),
})

// hotelId removido dos args — buscado via RPC (fix IDOR: gerente não pode passar hotel alheio)
type SaveSettingsArgs = z.infer<typeof settingsSchema>

export async function saveHotelSettings(args: SaveSettingsArgs) {
  const parsed = settingsSchema.safeParse(args)
  if (!parsed.success) return { success: false }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { data: role } = await supabase.rpc('get_my_role')
  if (!['manager', 'hotel_admin', 'super_admin'].includes(role ?? '')) {
    return { success: false }
  }

  // hotelId vem do servidor — nunca do cliente
  const { data: hotelId } = await supabase.rpc('get_my_hotel_id')
  if (!hotelId) return { success: false }

  const d = parsed.data
  const { error } = await supabase
    .from('hotel_settings')
    .update({
      welcome_message:       d.welcomeMessage || null,
      notifications_enabled: d.notificationsEnabled,
      notification_hour:     d.notificationHour,
      notification_minute:   d.notificationMinute,
      ranking_visible:       d.rankingVisible,
      active_sectors:        d.activeSectors,
      updated_at:            new Date().toISOString(),
    })
    .eq('hotel_id', hotelId)

  if (error) return { success: false }

  revalidatePath('/gerente/configuracoes')
  return { success: true }
}

export async function toggleEmployeeActive(employeeId: string, active: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { data: role } = await supabase.rpc('get_my_role')
  if (!['manager', 'hotel_admin', 'super_admin'].includes(role ?? '')) {
    return { success: false }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', employeeId)
    .eq('role', 'employee')   // nunca afeta admins

  if (error) return { success: false }

  revalidatePath('/gerente/funcionarios')
  return { success: true }
}
