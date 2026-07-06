/**
 * Login exclusivo do super_admin RecebaBem — /acesso
 * URL interna, não divulgada para hotéis/funcionários.
 * Design sóbrio de backoffice para diferenciar do login de hotel.
 */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
})
type Form = z.infer<typeof schema>

export default function AcessoPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  async function onSubmit(data: Form) {
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email:    data.email,
      password: data.password,
    })

    if (authError || !authData.user) {
      setError('Credenciais inválidas.')
      return
    }

    // Verifica se é realmente super_admin antes de redirecionar
    const { data: role } = await supabase.rpc('get_my_role')

    if (role !== 'super_admin') {
      // Faz logout e nega — funcionários não devem saber que esta rota existe
      await supabase.auth.signOut()
      setError('Credenciais inválidas.')
      return
    }

    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Marca sóbria */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-brand-blue-light" />
          </div>
          <h1 className="text-xl font-bold text-white">RecebaBem</h1>
          <p className="text-gray-500 text-xs mt-1">Acesso administrativo</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <input
              type="email"
              autoComplete="email"
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600
                         rounded-xl px-4 py-3 outline-none focus:border-brand-blue transition-colors"
              placeholder="E-mail"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600
                         rounded-xl px-4 py-3 pr-11 outline-none focus:border-brand-blue transition-colors"
              placeholder="Senha"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold
                       py-3 rounded-xl transition-colors flex items-center justify-center gap-2
                       disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={18} className="animate-spin" />}
            {isSubmitting ? 'Verificando…' : 'Entrar'}
          </button>
        </form>

        {/* Sem link para /login — isolamento total */}
        <p className="text-center text-gray-700 text-xs mt-8">
          Acesso restrito à equipe RecebaBem
        </p>
      </div>
    </div>
  )
}
