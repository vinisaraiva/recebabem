/**
 * Middleware do Next.js — executado em TODA requisição antes do render.
 * Responsabilidades:
 *  1. Atualizar o token de sessão do Supabase
 *  2. Redirecionar usuários não autenticados para /login
 *  3. Redirecionar usuários autenticados para a área correta pelo role
 */
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import type { UserRole } from '@/types/database'

// Rotas públicas — não exigem autenticação
const PUBLIC_PATHS = ['/login', '/register', '/convite', '/verify', '/acesso']

// Destino padrão por role após login
const ROLE_HOME: Record<UserRole, string> = {
  employee:    '/inicio',
  manager:     '/gerente/painel',
  hotel_admin: '/gerente/painel',
  super_admin: '/admin/dashboard',
}

// Login correto por role (evita super_admin usar /login e employee usar /acesso)
const ROLE_LOGIN: Record<string, string> = {
  super_admin: '/acesso',
  default:     '/login',
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignora arquivos estáticos e APIs internas do Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Atualiza a sessão e obtém o usuário atual
  const { supabaseResponse, user, supabase } = await updateSession(request)

  const isPublicPath = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // Usuário NÃO autenticado tentando acessar rota protegida
  if (!user && !isPublicPath) {
    // Rotas /admin → manda para /acesso (login do admin, não /login)
    const loginPath = pathname.startsWith('/admin') ? '/acesso' : '/login'
    const loginUrl  = new URL(loginPath, request.url)
    if (loginPath === '/login') loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Usuário JÁ autenticado tentando acessar as páginas de login → redireciona
  if (user && (pathname === '/login' || pathname === '/register' || pathname === '/acesso')) {
    const role = await getUserRole(supabase, user.id)
    const home = ROLE_HOME[role as UserRole] ?? '/inicio'
    return NextResponse.redirect(new URL(home, request.url))
  }

  // Funcionário/gerente tentando usar /acesso → nega silenciosamente (não revela que existe)
  if (!user && pathname === '/acesso') {
    // Deixa a página /acesso renderizar — o login verifica o role internamente
    return supabaseResponse
  }

  // Proteção por role — impede que employee acesse rotas de gerente/admin
  if (user && !isPublicPath) {
    const role = await getUserRole(supabase, user.id)

    if (pathname.startsWith('/admin') && role !== 'super_admin') {
      return NextResponse.redirect(new URL('/inicio', request.url))
    }

    if (
      pathname.startsWith('/gerente') &&
      role !== 'manager' &&
      role !== 'hotel_admin' &&
      role !== 'super_admin'
    ) {
      return NextResponse.redirect(new URL('/inicio', request.url))
    }
  }

  return supabaseResponse
}

/** Busca o role do usuário via RPC (SECURITY DEFINER — seguro). */
async function getUserRole(
  supabase: ReturnType<typeof createServerClient<Database>>,
  _userId: string
): Promise<string> {
  const { data } = await supabase.rpc('get_my_role')
  return data ?? 'employee'
}

export const config = {
  matcher: [
    // Aplica o middleware em todas as rotas EXCETO _next/static, _next/image e favicon
    '/((?!_next/static|_next/image|favicon.ico|icons|screenshots).*)',
  ],
}
