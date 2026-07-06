/**
 * Server Actions para convites.
 */
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { APP_URL } from '@/lib/constants'

const inviteSchema = z.object({
  email:  z.string().email('E-mail inválido.'),
  name:   z.string().min(2, 'Nome deve ter ao menos 2 caracteres.').max(100).optional(),
  sector: z.string().min(1, 'Setor obrigatório.').max(50),
})

interface InviteResult {
  success: boolean
  link?:   string
  error?:  string
}

export async function createInvitation(args: {
  email:  string
  name?:  string
  sector: string
}): Promise<InviteResult> {
  const parsed = inviteSchema.safeParse(args)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { email, name, sector } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado.' }

  // Verifica role — apenas manager/hotel_admin/super_admin podem convidar
  const { data: role } = await supabase.rpc('get_my_role')
  if (!['manager', 'hotel_admin', 'super_admin'].includes(role ?? '')) {
    return { success: false, error: 'Sem permissão.' }
  }

  const hotelId = await getHotelId(supabase)
  if (!hotelId) return { success: false, error: 'Hotel não encontrado.' }

  // Token único e data de expiração (7 dias)
  const token     = crypto.randomUUID().replace(/-/g, '')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from('invitations').insert({
    hotel_id:   hotelId,
    email,
    name:       name || null,
    role:       'employee',
    sector:     sector || 'geral',
    token,
    expires_at: expiresAt,
    invited_by: user.id,
  })

  if (error) {
    if (error.message.includes('duplicate')) {
      return { success: false, error: 'Já existe um convite pendente para este e-mail.' }
    }
    return { success: false, error: 'Erro ao criar convite.' }
  }

  revalidatePath('/gerente/funcionarios')

  return {
    success: true,
    link:    `${APP_URL}/convite/${token}`,
  }
}

async function getHotelId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase.rpc('get_my_hotel_id')
  return data as string | null
}
