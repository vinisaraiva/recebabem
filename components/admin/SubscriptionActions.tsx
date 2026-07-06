/**
 * Ações de assinatura — super_admin pode suspender ou cancelar.
 */
'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { setSubscriptionStatus } from '@/lib/actions/admin-hotels'

interface Props {
  hotelId: string
  currentStatus: string
}

export default function SubscriptionActions({ hotelId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [confirm,   setConfirm]      = useState<string | null>(null)

  function act(status: 'active' | 'suspended' | 'cancelled') {
    startTransition(async () => {
      await setSubscriptionStatus(hotelId, status)
      setConfirm(null)
    })
  }

  const isSuspended = currentStatus === 'suspended'
  const isCancelled = currentStatus === 'cancelled'

  return (
    <div className="space-y-3">
      {/* Reativar */}
      {(isSuspended || isCancelled) && (
        <div className="flex items-center gap-3">
          <button
            disabled={isPending}
            onClick={() => act('active')}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Reativar Assinatura
          </button>
        </div>
      )}

      {/* Suspender */}
      {!isSuspended && !isCancelled && (
        confirm === 'suspend' ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-700">Confirma suspensão?</p>
            <button
              disabled={isPending}
              onClick={() => act('suspended')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Sim, suspender
            </button>
            <button onClick={() => setConfirm(null)} className="text-sm text-gray-500 hover:underline">
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm('suspend')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            <AlertTriangle size={14} />
            Suspender Acesso
          </button>
        )
      )}

      {/* Cancelar contrato */}
      {!isCancelled && (
        confirm === 'cancel' ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-700">Cancelar permanentemente?</p>
            <button
              disabled={isPending}
              onClick={() => act('cancelled')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Sim, cancelar
            </button>
            <button onClick={() => setConfirm(null)} className="text-sm text-gray-500 hover:underline">
              Não
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm('cancel')}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <AlertTriangle size={14} />
            Cancelar Contrato
          </button>
        )
      )}
    </div>
  )
}
