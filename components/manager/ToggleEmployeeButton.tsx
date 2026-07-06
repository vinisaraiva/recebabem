/**
 * Botão para ativar/desativar funcionário — gerente.
 */
'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toggleEmployeeActive } from '@/lib/actions/hotel-settings'

interface Props {
  employeeId: string
  active:     boolean
}

export default function ToggleEmployeeButton({ employeeId, active }: Props) {
  const [isActive,  setIsActive]  = useState(active)
  const [isPending, startTransition] = useTransition()
  const [confirm,   setConfirm]   = useState(false)

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleEmployeeActive(employeeId, !isActive)
      if (result.success) setIsActive((v) => !v)
      setConfirm(false)
    })
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-700">
          {isActive ? 'Desativar este funcionário?' : 'Reativar este funcionário?'}
        </p>
        <button
          disabled={isPending}
          onClick={handleToggle}
          className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 text-white ${
            isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-green hover:bg-brand-green/90'
          }`}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isActive ? 'Sim, desativar' : 'Sim, reativar'}
        </button>
        <button onClick={() => setConfirm(false)} className="text-sm text-gray-500 hover:underline">
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className={`text-sm font-medium px-4 py-2 rounded-xl border-2 transition-colors ${
        isActive
          ? 'border-red-200 text-red-500 hover:bg-red-50'
          : 'border-brand-green text-brand-green hover:bg-brand-green/5'
      }`}
    >
      {isActive ? 'Desativar' : 'Reativar'}
    </button>
  )
}
