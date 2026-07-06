/**
 * Server Actions para perfil do funcionário.
 */
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const profileSchema = z.object({
  name:   z.string().min(2, 'Nome deve ter ao menos 2 caracteres.').max(100).trim(),
  sector: z.string().max(50).optional(),
})

export async function updateProfile(name: string, sector: string) {
  const parsed = profileSchema.safeParse({ name, sector: sector || undefined })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado.' }

  const { error } = await supabase
    .from('profiles')
    .update({
      name:       parsed.data.name,
      sector:     parsed.data.sector || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { success: false, error: 'Erro ao salvar.' }

  revalidatePath('/inicio')
  revalidatePath('/perfil')
  return { success: true }
}
