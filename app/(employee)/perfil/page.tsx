/**
 * Perfil do funcionário — /perfil
 * Editar nome e setor. Ver email (read-only).
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Info } from 'lucide-react'
import ProfileForm from './ProfileForm'

export const metadata = { title: 'Meu Perfil' }

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, sector')
    .eq('id', user.id)
    .single()

  return (
    <div className="px-4 pt-8 pb-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      <ProfileForm
        email={user.email ?? ''}
        name={profile?.name ?? ''}
        sector={profile?.sector ?? ''}
      />

      {/* Link para Sobre */}
      <Link
        href="/sobre"
        className="mt-4 flex items-center gap-3 card hover:shadow-md transition-shadow"
      >
        <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info size={18} className="text-brand-blue" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">Sobre o RecebaBem</p>
          <p className="text-xs text-gray-400">Metodologia e equipe</p>
        </div>
        <span className="text-gray-400 text-sm">→</span>
      </Link>
    </div>
  )
}
