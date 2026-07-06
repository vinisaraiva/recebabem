/**
 * Certificados do funcionário — /certificados
 * Mostra status de cada certificado solicitado.
 * O URL do certificado só aparece após status = 'issued' (enforçado no DB).
 */
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate } from '@/lib/utils/format'
import { Award, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const metadata = { title: 'Certificados' }

// Ícones e textos por status
const STATUS_CONFIG = {
  pending: {
    icon:  <Clock size={20} className="text-yellow-500" />,
    label: 'Aguardando emissão',
    bg:    'bg-yellow-50',
    text:  'text-yellow-700',
  },
  issued: {
    icon:  <CheckCircle2 size={20} className="text-brand-green" />,
    label: 'Emitido',
    bg:    'bg-green-50',
    text:  'text-green-700',
  },
  revoked: {
    icon:  <XCircle size={20} className="text-red-500" />,
    label: 'Revogado',
    bg:    'bg-red-50',
    text:  'text-red-700',
  },
}

export default async function CertificadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Usa a view my_certificate_status que mascara o URL até emissão
  const { data: certificates } = await supabase
    .from('my_certificate_status')
    .select('*')
    .order('requested_at', { ascending: false })

  return (
    <div className="px-4 pt-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Award size={24} className="text-brand-green" />
        Certificados
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Seus certificados de conclusão
      </p>

      {!certificates || certificates.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎓</p>
          <p className="text-gray-500 font-medium">Nenhum certificado ainda</p>
          <p className="text-gray-400 text-sm mt-1">
            Complete uma trilha 100% para solicitar seu certificado
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {certificates.map((cert: Record<string, unknown>) => {
            const status = (cert.status as keyof typeof STATUS_CONFIG) ?? 'pending'
            const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending

            return (
              <div key={cert.id as string} className="card">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${config.bg}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {cert.track_name as string ?? 'Trilha'}
                    </p>
                    <span className={`text-xs font-medium ${config.text}`}>
                      {config.label}
                    </span>

                    {cert.requested_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Solicitado em {formatDate(cert.requested_at as string)}
                      </p>
                    )}

                    {/* Mensagem informativa enquanto pendente */}
                    {status === 'pending' && (
                      <p className="text-xs text-yellow-600 mt-2 bg-yellow-50 rounded-lg px-3 py-2">
                        Seu certificado está sendo preparado. Você será notificado quando estiver pronto.
                      </p>
                    )}

                    {/* Link para download apenas quando emitido */}
                    {status === 'issued' && cert.certificate_url && (
                      <a
                        href={cert.certificate_url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-brand-blue text-sm font-medium hover:underline"
                      >
                        Baixar certificado →
                      </a>
                    )}

                    {/* Código de verificação quando emitido */}
                    {status === 'issued' && cert.verification_code && (
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        Código: {cert.verification_code as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
