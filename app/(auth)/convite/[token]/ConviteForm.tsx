/**
 * Formulário client-side para registro via convite.
 * Cria conta no Supabase Auth e redireciona para /inicio.
 */
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter ao menos um número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não conferem',
  path:    ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

interface Props {
  token: string
  email: string
  name:  string
}

export default function ConviteForm({ token, email, name }: Props) {
  const router   = useRouter()
  const supabase = createClient()

  const [showPwd,    setShowPwd]    = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver:      zodResolver(registerSchema),
    defaultValues: { name },
  })

  async function onSubmit(data: RegisterForm) {
    setServerError(null)

    // Cria a conta Supabase Auth — o trigger handle_new_profile cria o perfil
    const { error } = await supabase.auth.signUp({
      email,
      password: data.password,
      options: {
        data: {
          name:             data.name,
          invitation_token: token,
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setServerError('Este e-mail já tem uma conta. Faça login.')
      } else {
        setServerError('Erro ao criar conta. Tente novamente.')
      }
      return
    }

    router.push('/inicio')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* E-mail (read-only — vem do convite) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          readOnly
          className="input bg-gray-50 cursor-not-allowed text-gray-500"
        />
      </div>

      {/* Nome */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Seu nome completo
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="input"
          placeholder="João Silva"
          {...register('name')}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      {/* Senha */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Criar senha
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPwd ? 'text' : 'password'}
            autoComplete="new-password"
            className="input pr-11"
            placeholder="Mínimo 8 caracteres"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmar senha */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmar senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="input"
          placeholder="Repita a senha"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        {isSubmitting ? 'Criando conta…' : 'Criar minha conta'}
      </button>
    </form>
  )
}
