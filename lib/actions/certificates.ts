/**
 * Server Actions para certificados.
 * 'use server' garante que este código NUNCA vai para o browser.
 */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ActionResult {
  success: boolean
  error?:  string
}

/**
 * Solicita emissão de certificado para uma trilha concluída.
 * O RPC valida que a conclusão é 100% antes de criar o registro.
 */
export async function requestCertificate(trackId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado.' }

  const { data, error } = await supabase.rpc('request_my_certificate', {
    p_track_id: trackId,
  })

  if (error) {
    // Mensagens amigáveis para erros conhecidos
    if (error.message.includes('not completed')) {
      return { success: false, error: 'Você ainda não completou 100% desta trilha.' }
    }
    if (error.message.includes('already exists')) {
      return { success: false, error: 'Você já solicitou o certificado desta trilha.' }
    }
    return { success: false, error: 'Erro ao solicitar certificado. Tente novamente.' }
  }

  // Atualiza a página de certificados
  revalidatePath('/certificados')

  return { success: true }
}
