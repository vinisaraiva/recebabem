/**
 * Layout da área do gerente/hotel_admin.
 * Sidebar no desktop com active states + logout, bottom nav no mobile.
 */
import { createClient } from '@/lib/supabase/server'
import {
  LayoutDashboard, Users, BarChart2, Settings,
} from 'lucide-react'
import { NAV_MANAGER } from '@/lib/constants'
import BottomNav from '@/components/nav/BottomNav'
import SidebarLink from '@/components/nav/SidebarLink'
import LogoutButton from '@/components/nav/LogoutButton'

const SIDEBAR_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  '/gerente/painel':        LayoutDashboard,
  '/gerente/funcionarios':  Users,
  '/gerente/relatorios':    BarChart2,
  '/gerente/configuracoes': Settings,
}

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single()
    : { data: null }

  const { data: hotelData } = user
    ? await supabase.rpc('get_my_hotel_id').then(async (res) => {
        if (!res.data) return { data: null }
        return supabase
          .from('hotels')
          .select('name')
          .eq('id', res.data)
          .single()
      })
    : { data: null }

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar — desktop ── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 flex-shrink-0">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-brand-blue tracking-tight">
            Receba<span className="text-brand-green">Bem</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Painel do Gerente</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Menu do gerente">
          {NAV_MANAGER.map((item) => {
            const Icon = SIDEBAR_ICONS[item.href] ?? LayoutDashboard
            return (
              <SidebarLink key={item.href} href={item.href} label={item.label} variant="light">
                <Icon size={17} strokeWidth={1.75} className="flex-shrink-0" />
              </SidebarLink>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
          {profile && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-blue text-xs font-bold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate leading-tight">
                  {profile.name}
                </p>
                <p className="text-[11px] text-gray-400 leading-tight capitalize">
                  {hotelData?.name ?? 'Hotel'}
                </p>
              </div>
            </div>
          )}
          <LogoutButton variant="light" />
        </div>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="flex-1 pb-20 md:pb-0 overflow-auto min-h-screen">
        {children}
      </main>

      {/* ── Bottom nav — mobile ── */}
      <div className="md:hidden">
        <BottomNav items={NAV_MANAGER} />
      </div>
    </div>
  )
}
