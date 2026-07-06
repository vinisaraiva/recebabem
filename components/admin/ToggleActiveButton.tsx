/**
 * Botão toggle ativo/inativo para trilhas, módulos e missões.
 * Chama Server Action que faz o UPDATE no Supabase.
 */
'use client'

import { useState, useTransition } from 'react'
import { toggleActive } from '@/lib/actions/admin-content'
import { cn } from '@/lib/utils/cn'

interface Props {
  table:  'tracks' | 'modules' | 'missions'
  id:     string
  active: boolean
  small?: boolean
}

export default function ToggleActiveButton({ table, id, active: initialActive, small }: Props) {
  const [active, setActive] = useState(initialActive)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const next = !active
      setActive(next) // Optimistic update
      const result = await toggleActive({ table, id, active: next })
      if (!result.success) setActive(active) // Rollback
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={active ? 'Desativar' : 'Ativar'}
      className={cn(
        'rounded-full transition-colors flex-shrink-0',
        small ? 'w-8 h-4' : 'w-10 h-5',
        active ? 'bg-brand-green' : 'bg-gray-200',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'block rounded-full bg-white shadow transition-transform',
        small ? 'w-3 h-3 m-0.5' : 'w-4 h-4 m-0.5',
        active
          ? small ? 'translate-x-4' : 'translate-x-5'
          : 'translate-x-0'
      )} />
    </button>
  )
}
