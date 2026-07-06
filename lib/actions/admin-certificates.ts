/**
 * Server Actions exclusivas do super_admin para certificados.
 * Usa createAdminClient para bypass de RLS na escrita.
 */
'use server'

import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const issueSchema = z.object({
  certificateId:  z.string().uuid('ID inválido.'),
  certificateUrl: z.string().url('URL inválida.').startsWith('https://', 'URL deve usar HTTPS.'),
  notes:          z.string().max(500).optional(),
})

export async function issueCertificate(args: {
  certificateId:  string
  certificateUrl: string
  notes?:         string
}) {
  const parsed = issueSchema.safeParse(args)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { certificateId, certificateUrl, notes } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado.' }

  // Confirma que é super_admin
  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false, error: 'Sem permissão.' }

  // Admin client para bypass RLS (certificate_url só pode ser setado quando issued)
  const admin = createAdminClient()

  const { error } = await admin
    .from('certificates')
    .update({
      status:          'issued',
      certificate_url: certificateUrl,
      issued_at:       new Date().toISOString(),
      issued_by:       user.id,
      notes:           notes || null,
    })
    .eq('id', certificateId)
    .eq('status', 'pending') // Só emite se ainda estiver pendente

  if (error) {
    return { success: false, error: 'Erro ao emitir certificado.' }
  }

  // TODO: enviar notificação push para o funcionário

  revalidatePath('/admin/certificados')
  return { success: true }
}
