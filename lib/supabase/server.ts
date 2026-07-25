/**
 * Cliente Supabase para o SERVIDOR (Server Components, Server Actions, Route Handlers).
 * Lê os cookies da requisição para manter a sessão do usuário.
 * Exporta também um cliente admin com service role para operações privilegiadas.
 */
import 'server-only' // Guard: impede importação acidental em Client Components
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/** Cliente padrão — usa a sessão do usuário logado (RLS ativo). */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()              { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Pode falhar em Server Components (read-only) — o middleware
            // é responsável por atualizar os cookies de sessão.
          }
        },
      },
      // Desabilita cache do Next.js para todas as chamadas Supabase no servidor.
      // Sem isso, respostas de SELECT ficam cacheadas entre requisições de usuários diferentes.
      global: {
        fetch: (url, options = {}) =>
          fetch(url, { ...options, cache: 'no-store' }),
      },
    }
  )
}

/**
 * Cliente admin com service role — BYPASS de RLS.
 * Use APENAS em Server Actions ou Route Handlers para operações
 * que exigem acesso irrestrito (ex: admin_create_hotel).
 * NUNCA exponha ou importe em arquivos client-side.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local')
  }

  return createSupabaseAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        // Desabilita persistência de sessão no servidor — cada chamada é stateless
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  )
}
