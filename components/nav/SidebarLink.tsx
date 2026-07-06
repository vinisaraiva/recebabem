/**
 * Link de sidebar com active state automático via usePathname.
 * Compartilhado entre manager e admin layouts.
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

interface Props {
  href:     string
  label:    string
  variant?: 'light' | 'dark'
  children?: React.ReactNode
}

export default function SidebarLink({ href, label, variant = 'light', children }: Props) {
  const pathname = usePathname()
  const active   = pathname === href || pathname.startsWith(`${href}/`)

  if (variant === 'dark') {
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          active
            ? 'bg-white/20 text-white'
            : 'text-blue-200 hover:bg-white/10 hover:text-white'
        )}
      >
        {children}
        {label}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
        active
          ? 'bg-brand-blue/10 text-brand-blue font-semibold'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
    >
      {children}
      {label}
    </Link>
  )
}
