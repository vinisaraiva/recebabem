/**
 * Gestão de planos — /admin/planos
 * Super_admin define quais trilhas cada plano inclui.
 */
import { createClient } from '@/lib/supabase/server'
import PlanTracksEditor from './PlanTracksEditor'

export const metadata = { title: 'Planos' }

export default async function PlanosPage() {
  const supabase = await createClient()

  const [{ data: plans }, { data: tracks }, { data: planTracks }] = await Promise.all([
    supabase.from('plans').select('id, slug, name, price_monthly').order('price_monthly'),
    supabase.from('tracks').select('id, slug, name, icon').order('order_index'),
    supabase.from('plan_tracks').select('plan_id, track_id'),
  ])

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Planos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Defina quais trilhas cada plano inclui. Novos hotéis recebem as trilhas do plano contratado automaticamente.
        </p>
      </div>

      <PlanTracksEditor
        plans={plans ?? []}
        tracks={tracks ?? []}
        planTracks={planTracks ?? []}
      />
    </div>
  )
}
