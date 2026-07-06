/**
 * Server Actions para gestão de hotéis (super_admin).
 */
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const hotelSchema = z.object({
  name:  z.string().min(2, 'Nome obrigatório.').max(100),
  email: z.string().email('E-mail inválido.').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  city:  z.string().max(100).optional(),
  state: z.string().max(2).optional(),
})

export async function createHotel(args: {
  name:   string
  email?: string
  phone?: string
  city?:  string
  state?: string
}) {
  const parsed = hotelSchema.safeParse(args)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { name, email, phone, city, state } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false, error: 'Sem permissão.' }

  // Gera slug a partir do nome
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // RPC cria hotel + hotel_settings + subscription trial em uma transação
  const { data, error } = await supabase.rpc('admin_create_hotel', {
    p_name:  name,
    p_slug:  slug,
    p_email: email  || null,
    p_phone: phone  || null,
    p_city:  city   || 'Porto Seguro',
    p_state: state  || 'BA',
  })

  if (error) {
    if (error.message.includes('slug')) {
      return { success: false, error: 'Já existe um hotel com nome similar.' }
    }
    return { success: false, error: 'Erro ao criar hotel.' }
  }

  revalidatePath('/admin/hoteis')
  revalidatePath('/admin/dashboard')

  return { success: true, hotelId: data as string }
}

interface UpdateHotelArgs {
  hotelId: string
  name:    string
  email?:  string
  phone?:  string
  city?:   string
  state?:  string
}

export async function updateHotel({ hotelId, name, email, phone, city, state }: UpdateHotelArgs) {
  const parsed = hotelSchema.safeParse({ name, email, phone, city, state })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false, error: 'Sem permissão.' }

  const d = parsed.data
  const { error } = await supabase
    .from('hotels')
    .update({ name: d.name, email: d.email || null, phone: d.phone || null, city: d.city || null, state: d.state || null })
    .eq('id', hotelId)

  if (error) return { success: false, error: 'Erro ao salvar.' }

  revalidatePath(`/admin/hoteis/${hotelId}`)
  revalidatePath('/admin/hoteis')
  return { success: true }
}

export async function setSubscriptionStatus(hotelId: string, status: 'active' | 'suspended' | 'cancelled') {
  const supabase = await createClient()
  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false, error: 'Sem permissão.' }

  const { error } = await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('hotel_id', hotelId)

  if (error) return { success: false, error: 'Erro ao atualizar assinatura.' }

  revalidatePath(`/admin/hoteis/${hotelId}`)
  revalidatePath('/admin/hoteis')
  revalidatePath('/admin/dashboard')
  return { success: true }
}
