/**
 * Funções de formatação usadas em toda a aplicação.
 * Centralizado aqui para garantir consistência de locale e moeda.
 */
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Datas ────────────────────────────────────────────────────────────────────

/** Formata data como "04 jul. 2026" */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM. yyyy", { locale: ptBR })
}

/** Formata como "hoje", "ontem" ou "04 jul." */
export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d))     return 'hoje'
  if (isYesterday(d)) return 'ontem'
  return format(d, "dd MMM.", { locale: ptBR })
}

/** "há 2 horas", "há 3 dias" */
export function formatTimeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })
}

/** "04/07/2026 às 14:30" */
export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

// ─── Moeda ────────────────────────────────────────────────────────────────────

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style:    'currency',
  currency: 'BRL',
})

/** Formata centavos (int) → "R$ 297,00" */
export function formatCurrency(cents: number): string {
  return brlFormatter.format(cents / 100)
}

/** Formata número real → "R$ 297,00" */
export function formatCurrencyFloat(value: number): string {
  return brlFormatter.format(value)
}

// ─── Pontos e gamificação ─────────────────────────────────────────────────────

/** "1.250 pts" */
export function formatPoints(points: number): string {
  return `${points.toLocaleString('pt-BR')} pts`
}

/** Pluraliza palavras simples: formatPlural(1, 'missão', 'missões') */
export function formatPlural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

/** "75%" */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

// ─── Strings ──────────────────────────────────────────────────────────────────

/** Capitaliza primeira letra de cada palavra */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase())
}

/** Trunca com reticências: truncate("texto longo", 20) */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 1) + '…'
}

/** "recepcao" → "Recepção" — mapa de slugs para nomes legíveis */
const SECTOR_LABELS: Record<string, string> = {
  recepcao:    'Recepção',
  governanca:  'Governança',
  ab:          'A&B',
  turismo:     'Turismo',
  manutencao:  'Manutenção',
  geral:       'Geral',
}

export function formatSector(slug: string): string {
  return SECTOR_LABELS[slug] ?? titleCase(slug)
}
