/**
 * Layout do painel super_admin.
 * Sidebar fixa com active states, user info e logout.
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  LayoutDashboard, Building2, BookOpen, Award, CreditCard, Layers,
} from 'lucide-react'
import { NAV_ADMIN } from '@/lib/constants'
import SidebarLink from '@/components/nav/SidebarLink'
import LogoutButton from '@/components/nav/LogoutButton'

const SIDEBAR_ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  '/admin/dashboard':    LayoutDashboard,
  '/admin/hoteis':       Building2,
  '/admin/conteudo':     BookOpen,
  '/admin/planos':       Layers,
  '/admin/certificados': Award,
  '/admin/financeiro':   CreditCard,
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: role } = await supabase.rpc('get_my_role')

  if (role !== 'super_admin') redirect('/')

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()
    : { data: null }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 bg-brand-blue-dark flex flex-col flex-shrink-0 min-h-screen">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Receba<span className="text-brand-green-light">Bem</span>
          </h1>
          <p className="text-[11px] text-blue-400 mt-0.5 font-medium tracking-wide uppercase">
            Super Admin
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Menu admin">
          {NAV_ADMIN.map((item) => {
            const Icon = SIDEBAR_ICONS[item.href] ?? LayoutDashboard
            return (
              <SidebarLink key={item.href} href={item.href} label={item.label} variant="dark">
                <Icon size={17} strokeWidth={1.75} className="flex-shrink-0" />
              </SidebarLink>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-5 border-t border-white/10 pt-3 space-y-0.5">
          {profile && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() ?? 'A'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate leading-tight">
                  {profile.name ?? 'Admin'}
                </p>
                <p className="text-[11px] text-blue-400 leading-tight">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <LogoutButton variant="dark" />
        </div>
      </aside>

      {/* ── Conteúdo ── */}
      <main className="flex-1 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
