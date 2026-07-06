/**
 * Fila de certificados — /admin/certificados
 * Super_admin vê todos os pedidos pendentes e emite manualmente.
 */
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils/format'
import { Award, Clock } from 'lucide-react'
import IssueCertificateButton from '@/components/admin/IssueCertificateButton'

export const metadata = { title: 'Certificados' }

export default async function AdminCertificadosPage() {
  const supabase = await createClient()

  // Fila de pedidos pendentes (view certificate_queue)
  const { data: queue } = await supabase
    .from('certificate_queue')
    .select('*')
    .order('requested_at', { ascending: true })

  // Certificados já emitidos (recentes)
  type IssuedCert = {
    id: string
    profile_id: string
    track_id: string
    issued_at: string
    verification_code: string
    notes: string | null
  }
  const { data: issued } = await supabase
    .from('certificates')
    .select('id, profile_id, track_id, issued_at, verification_code, notes')
    .eq('status', 'issued')
    .order('issued_at', { ascending: false })
    .limit(20) as { data: IssuedCert[] | null }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Award size={24} className="text-brand-green" />
        Certificados
      </h1>

      {/* Fila pendente */}
      <section className="mb-10">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Clock size={16} className="text-yellow-500" />
          Aguardando Emissão ({(queue ?? []).length})
        </h2>

        {(queue ?? []).length === 0 ? (
          <div className="card text-center py-8 text-gray-400 text-sm">
            ✅ Nenhum certificado na fila
          </div>
        ) : (
          <div className="space-y-3">
            {(queue ?? []).map((cert: Record<string, unknown>) => (
              <div key={cert.id as string} className="card">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {cert.employee_name as string}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cert.hotel_name as string} · {cert.track_name as string}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Solicitado em {formatDateTime(cert.requested_at as string)}
                    </p>
                  </div>
                  <IssueCertificateButton
                    certificateId={cert.id as string}
                    employeeName={cert.employee_name as string}
                    trackName={cert.track_name as string}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Emitidos recentes */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-3">
          Emitidos Recentemente
        </h2>
        <div className="space-y-2">
          {(issued ?? []).map((cert) => (
            <div key={cert.id} className="card flex items-center gap-3">
              <Award size={18} className="text-brand-green flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {cert.verification_code}
                </p>
                <p className="text-xs text-gray-400">
                  Emitido {formatDateTime(cert.issued_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
