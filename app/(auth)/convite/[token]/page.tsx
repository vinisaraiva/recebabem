/**
 * Página de aceite de convite — /convite/[token]
 * Valida o token via RPC, pré-preenche nome/e-mail e cria a conta.
 */
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConviteForm from './ConviteForm'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ConvitePage({ params }: PageProps) {
  const { token } = await params
  const supabase  = await createClient()

  // Valida o token via RPC pública (sem auth necessária)
  const { data, error } = await supabase.rpc('validate_invitation', { p_token: token })

  if (error || !data || data.length === 0) {
    notFound()
  }

  const invitation = data[0] as {
    id:         string
    email:      string
    name:       string | null
    role:       string
    hotel_name: string
    expires_at: string
  }

  // Convite expirado
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="text-center">
        <p className="text-2xl mb-2">⏰</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Convite expirado</h2>
        <p className="text-gray-500 text-sm">
          Este link não é mais válido. Solicite um novo convite ao seu gerente.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-6">
        <p className="text-3xl mb-2">🎉</p>
        <h2 className="text-xl font-bold text-gray-900">
          Você foi convidado!
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {invitation.hotel_name} te convida para treinar inglês
        </p>
      </div>

      <ConviteForm
        token={token}
        email={invitation.email}
        name={invitation.name ?? ''}
      />
    </>
  )
}
