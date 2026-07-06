/**
 * Página de login.
 * Usa React Hook Form + Zod para validação client-side,
 * e um Server Action para autenticação via Supabase.
 */
'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

// Schema de validação compartilhado com o servidor
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  // Valida que o destino é relativo — previne open redirect (?next=https://evil.com)
  const rawNext  = searchParams.get('next') ?? '/'
  const nextPath = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'
  const supabase     = createClient()

  const [showPassword, setShowPassword] = useState(false)
  const [serverError,  setServerError]  = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginForm) {
    setServerError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email:    data.email,
      password: data.password,
    })

    if (error) {
      // Mensagem amigável em português
      if (error.message.includes('Invalid login')) {
        setServerError('E-mail ou senha incorretos.')
      } else {
        setServerError('Erro ao entrar. Tente novamente.')
      }
      return
    }

    // Super_admin não deve usar este login — redireciona silenciosamente
    const { data: role } = await supabase.rpc('get_my_role')
    if (role === 'super_admin') {
      router.push('/admin/dashboard')
      router.refresh()
      return
    }

    router.push(nextPath === '/login' ? '/' : nextPath)
    router.refresh()
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h2>
      <p className="text-gray-500 text-sm mb-6">
        Acesse sua conta RecebaBem
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="seu@email.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-error text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="input pr-11"
              placeholder="••••••••"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-error text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Erro do servidor */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {serverError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Não tem conta?{' '}
        <Link href="/register" className="text-brand-blue font-medium hover:underline">
          Cadastre-se com convite
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
