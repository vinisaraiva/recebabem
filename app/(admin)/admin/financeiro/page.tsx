/**
 * Financeiro — /admin/financeiro
 * Visão geral de assinaturas, MRR e faturas recentes.
 */
import { createClient } from '@/lib/supabase/server'
import { formatCurrencyFloat, formatDate } from '@/lib/utils/format'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

export const metadata = { title: 'Financeiro' }

const INVOICE_STATUS: Record<string, { label: string; cls: string }> = {
  paid:      { label: 'Pago',     cls: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-700' },
  overdue:   { label: 'Atrasado', cls: 'bg-red-100 text-red-600' },
  cancelled: { label: 'Cancelado',cls: 'bg-gray-100 text-gray-400' },
}

export default async function FinanceiroPage() {
  const supabase = await createClient()

  // Métricas SaaS
  const { data: metrics } = await supabase
    .from('admin_saas_metrics')
    .select('*')
    .maybeSingle()

  // Histórico de faturas (view admin_invoice_history)
  const { data: invoices } = await supabase
    .from('admin_invoice_history')
    .select('*')
    .order('due_date', { ascending: false })
    .limit(30)

  const m = (metrics ?? {}) as Record<string, unknown>

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <DollarSign size={24} className="text-brand-green" />
        Financeiro
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'MRR',
            value: formatCurrencyFloat((m.mrr as number) ?? 0),
            sub:   'receita mensal',
            icon:  <TrendingUp size={18} />,
            color: 'text-brand-green',
          },
          {
            label: 'ARR',
            value: formatCurrencyFloat((m.arr as number) ?? 0),
            sub:   'receita anual',
            icon:  <DollarSign size={18} />,
            color: 'text-brand-blue',
          },
          {
            label: 'Ativos',
            value: String(m.active_subscriptions ?? 0),
            sub:   'assinaturas ativas',
            icon:  <CheckCircle2 size={18} />,
            color: 'text-brand-green',
          },
          {
            label: 'Em atraso',
            value: String(m.overdue_subscriptions ?? 0),
            sub:   'assinaturas vencidas',
            icon:  <AlertCircle size={18} />,
            color: 'text-red-500',
          },
        ].map((kpi) => (
          <div key={kpi.label} className="card">
            <div className={`flex items-center gap-2 ${kpi.color} mb-2`}>
              {kpi.icon}
              <span className="text-xs font-medium uppercase tracking-wide">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabela de faturas */}
      <h2 className="font-semibold text-gray-700 mb-3">Faturas</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Hotel', 'Fatura', 'Valor', 'Vencimento', 'Status'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(invoices ?? []).map((inv: Record<string, unknown>) => {
                const st = INVOICE_STATUS[(inv.status as string)] ?? INVOICE_STATUS.pending
                return (
                  <tr key={inv.id as string} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[160px]">
                      {inv.hotel_name as string}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {inv.invoice_number as string}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {formatCurrencyFloat((inv.amount as number) ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(inv.due_date as string)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {(invoices ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
