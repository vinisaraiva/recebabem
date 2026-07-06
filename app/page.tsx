/**
 * Rota raiz "/" — redireciona para a área correta conforme o role do usuário.
 * Usuários não autenticados são enviados ao /login pelo middleware.
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/database'

const ROLE_HOME: Record<UserRole, string> = {
  employee:    '/inicio',
  manager:     '/gerente/painel',
  hotel_admin: '/gerente/painel',
  super_admin: '/admin/dashboard',
}

export default async function RootPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Não autenticado — middleware já deveria ter redirecionado, mas por segurança:
  if (!user) redirect('/login')

  // Busca o role via RPC (SECURITY DEFINER — ignora RLS)
  const { data: role } = await supabase.rpc('get_my_role')

  const home = ROLE_HOME[(role as UserRole) ?? 'employee'] ?? '/inicio'
  redirect(home)
}
