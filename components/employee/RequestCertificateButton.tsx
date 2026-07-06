/**
 * Botão para solicitar emissão de certificado.
 * Chama o RPC request_my_certificate via Server Action.
 * Só aparece na UI quando completion = 100%.
 */
'use client'

import { useState } from 'react'
import { Award, Loader2 } from 'lucide-react'
import { requestCertificate } from '@/lib/actions/certificates'

interface Props {
  trackId: string
}

export default function RequestCertificateButton({ trackId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleClick() {
    setStatus('loading')

    const result = await requestCertificate(trackId)

    if (result.success) {
      setStatus('done')
      setMessage('Solicitação enviada! Você será notificado quando o certificado for emitido.')
    } else {
      setStatus('error')
      setMessage(result.error ?? 'Erro ao solicitar certificado.')
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm text-center">
        ✅ {message}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        {status === 'loading'
          ? <Loader2 size={18} className="animate-spin" />
          : <Award size={18} />
        }
        {status === 'loading' ? 'Solicitando…' : 'Solicitar Certificado'}
      </button>

      {status === 'error' && (
        <p className="text-red-500 text-xs mt-2 text-center">{message}</p>
      )}
    </div>
  )
}
