/**
 * Gestão de hotéis — /admin/hoteis
 * Lista todos os hotéis com status de assinatura e botão para criar novo.
 */
import { createClient } from '@/lib/supabase/server'
import { Building2, Users, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import CreateHotelButton from '@/components/admin/CreateHotelButton'
import Link from 'next/link'

export const metadata = { title: 'Hotéis' }

const STATUS_STYLE: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  trial:     'bg-blue-100 text-blue-700',
  overdue:   'bg-red-100 text-red-600',
  suspended: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-gray-100 text-gray-400',
}

export default async function AdminHoteisPage() {
  const supabase = await createClient()

  const { data: hotels } = await supabase
    .from('admin_hotels_overview')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 size={24} className="text-brand-blue" />
          Hotéis ({(hotels ?? []).length})
        </h1>
        <CreateHotelButton />
      </div>

      <div className="space-y-3">
        {(hotels ?? []).map((hotel: Record<string, unknown>) => (
          <Link key={hotel.id as string} href={`/admin/hoteis/${hotel.id as string}`} className="card block hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Info do hotel */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{hotel.name as string}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    STATUS_STYLE[hotel.subscription_status as string] ?? 'bg-gray-100 text-gray-500'
                  }`}>
                    {hotel.subscription_status as string}
                  </span>
                  <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full font-medium">
                    {hotel.plan as string}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {hotel.city as string}, {hotel.state as string}
                </p>
              </div>

              {/* Métricas */}
              <div className="flex items-center gap-6 text-sm flex-shrink-0">
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Users size={14} />
                  <span>{hotel.employee_count as number ?? 0} func.</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <TrendingUp size={14} />
                  <span>{Math.round((hotel.avg_progress as number) ?? 0)}%</span>
                </div>
                {hotel.created_at && (
                  <span className="text-gray-400 text-xs hidden md:block">
                    desde {formatDate(hotel.created_at as string)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}

        {(hotels ?? []).length === 0 && (
          <div className="card text-center py-12">
            <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum hotel cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
