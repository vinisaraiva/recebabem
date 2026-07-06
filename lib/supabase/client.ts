/**
 * Cliente Supabase para o BROWSER (componentes client-side).
 * Cria uma instância singleton para evitar múltiplas conexões.
 * NUNCA importe aqui o service role key — use apenas a anon key.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
