/**
 * Detalhe do funcionário — /gerente/funcionarios/[id]
 * Progresso por trilha, pontos, streak, toggle ativo.
 */
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flame, Star, TrendingUp, Award } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils/format'
import ToggleEmployeeButton from '@/components/manager/ToggleEmployeeButton'
import type { Tables } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function FuncionarioDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: role } = await supabase.rpc('get_my_role')
  if (!['manager', 'hotel_admin', 'super_admin'].includes(role ?? '')) redirect('/inicio')

  // Garante que o funcionário é do mesmo hotel (RLS protege, mas valida role)
  const { data: employee } = await supabase
    .from('profiles')
    .select('id, name, sector, active, created_at, onboarding_completed, avatar_url')
    .eq('id', id)
    .eq('role', 'employee')
    .single()

  if (!employee) notFound()

  // Progresso por trilha
  const { data: trackProgress } = await supabase
    .from('track_progress')
    .select(`
      completion_pct, started_at, completed_at, updated_at,
      tracks ( name, icon, color )
    `)
    .eq('profile_id', id)
    .order('updated_at', { ascending: false })

  // Pontos totais — aggregate no DB, sem limit (evita subcontagem)
  const { data: pointsData } = await supabase
    .from('points_ledger')
    .select('amount.sum()')
    .eq('profile_id', id)
    .single()

  const totalPoints = (pointsData as { sum: number } | null)?.sum ?? 0

  // Streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('profile_id', id)
    .maybeSingle()

  // Certificados
  const { data: certs } = await supabase
    .from('certificates')
    .select('id, status, requested_at, issued_at, tracks(name)')
    .eq('profile_id', id)
    .order('requested_at', { ascending: false })

  return (
    <div className="p-6 max-w-3xl">
      {/* Voltar */}
      <Link
        href="/gerente/funcionarios"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={15} />
        Funcionários
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-blue/10 flex items-center justify-center">
            <span className="text-brand-blue text-2xl font-bold">
              {employee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-sm text-gray-400 capitalize">
              {employee.sector ?? 'Geral'} · desde {formatRelativeDate(employee.created_at)}
              {!employee.active && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">inativo</span>
              )}
            </p>
          </div>
        </div>
        <ToggleEmployeeButton employeeId={employee.id} active={employee.active} />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card text-center">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-1">
            <Flame size={16} className="text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{streak?.current_streak ?? 0}</p>
          <p className="text-xs text-gray-400">streak atual</p>
        </div>
        <div className="card text-center">
          <div className="w-8 h-8 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-1">
            <Star size={16} className="text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPoints.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-400">pontos</p>
        </div>
        <div className="card text-center">
          <div className="w-8 h-8 bg-brand-green/10 rounded-xl flex items-center justify-center mx-auto mb-1">
            <Award size={16} className="text-brand-green" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{(certs ?? []).filter((c) => c.status === 'issued').length}</p>
          <p className="text-xs text-gray-400">certificados</p>
        </div>
      </div>

      {/* Progresso por trilha */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-blue" />
          Progresso por Trilha
        </h2>

        {(trackProgress ?? []).length === 0 ? (
          <div className="card text-center py-6 text-gray-400 text-sm">
            Nenhuma trilha iniciada.
          </div>
        ) : (
          <div className="space-y-3">
            {(trackProgress ?? []).map((tp) => {
              const track = tp.tracks as Pick<Tables<'tracks'>, 'name' | 'icon' | 'color'> | null
              if (!track) return null
              return (
                <div key={track.name} className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{track.icon ?? '📚'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900 text-sm">{track.name}</p>
                        <span className="text-sm font-bold text-gray-700">
                          {Math.round(tp.completion_pct)}%
                        </span>
                      </div>
                      {tp.completed_at ? (
                        <p className="text-xs text-brand-green font-medium">
                          ✅ Concluída {formatRelativeDate(tp.completed_at)}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">
                          Última atividade: {tp.updated_at ? formatRelativeDate(tp.updated_at) : '—'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${tp.completion_pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Certificados */}
      {(certs ?? []).length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award size={16} className="text-brand-green" />
            Certificados
          </h2>
          <div className="space-y-2">
            {(certs ?? []).map((cert) => {
              const track = cert.tracks as { name: string } | null
              return (
                <div key={cert.id} className="card flex items-center gap-3">
                  <Award size={18} className={cert.status === 'issued' ? 'text-brand-green' : 'text-gray-300'} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{track?.name ?? '—'}</p>
                    <p className="text-xs text-gray-400">
                      {cert.status === 'issued' && cert.issued_at
                        ? `Emitido ${formatRelativeDate(cert.issued_at)}`
                        : cert.status === 'pending'
                        ? 'Aguardando emissão'
                        : cert.status}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    cert.status === 'issued'  ? 'bg-green-100 text-green-700' :
                    cert.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {cert.status}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
