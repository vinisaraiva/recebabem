/**
 * Helper para o middleware do Next.js.
 * Responsável por atualizar o token de sessão do Supabase a cada requisição
 * (o token expira a cada hora — sem isso o usuário seria deslogado).
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()              { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Propaga os cookies tanto na request quanto na response
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresca a sessão — ESSENCIAL: não remover este await
  const { data: { user } } = await supabase.auth.getUser()

  return { supabaseResponse, user, supabase }
}
