/**
 * Botão de logout — client component reutilizável.
 * Funciona em todos os layouts (employee, manager, admin).
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

interface Props {
  /** visual variant — dark for admin sidebar, light for manager */
  variant?: 'light' | 'dark'
  className?: string
}

export default function LogoutButton({ variant = 'light', className }: Props) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sair da conta"
      className={cn(
        'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
        variant === 'dark'
          ? 'text-blue-300 hover:bg-white/10 hover:text-white disabled:opacity-50'
          : 'text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50',
        className
      )}
    >
      {loading
        ? <Loader2 size={16} className="animate-spin flex-shrink-0" />
        : <LogOut size={16} className="flex-shrink-0" />
      }
      {loading ? 'Saindo…' : 'Sair'}
    </button>
  )
}
