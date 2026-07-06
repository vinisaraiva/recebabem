/**
 * Navegação inferior estilo app nativo.
 * Active state com pill background e ícone levemente ampliado.
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  Home, BookOpen, Trophy, BarChart2, Award,
  LayoutDashboard, Users, Settings, User,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Home,
  BookOpen,
  Trophy,
  BarChart2,
  Award,
  LayoutDashboard,
  Users,
  Settings,
  User,
}

interface NavItem {
  href:  string
  label: string
  icon:  string
}

interface Props {
  items: readonly NavItem[]
}

export default function BottomNav({ items }: Props) {
  const pathname = usePathname()

  // Esconde nav em páginas de missão — experiência focada sem distrações
  const isMission = pathname.includes('/missao/')
  if (isMission) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 safe-bottom z-50"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-1">
        {items.map((item) => {
          const Icon   = ICON_MAP[item.icon] ?? Home
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-150',
                active ? 'text-brand-blue' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {/* Pill active indicator */}
              <span
                className={cn(
                  'flex items-center justify-center w-10 h-6 rounded-full transition-all duration-200',
                  active ? 'bg-brand-blue/10' : ''
                )}
              >
                <Icon
                  size={active ? 21 : 20}
                  strokeWidth={active ? 2.25 : 1.75}
                />
              </span>
              <span className={cn(
                'text-[10px] leading-none transition-all duration-150',
                active ? 'font-semibold' : 'font-medium'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
