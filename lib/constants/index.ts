/**
 * Constantes globais da aplicação RecebaBem.
 * Altere aqui — os componentes importam deste arquivo.
 */

// ─── App ──────────────────────────────────────────────────────────────────────

export const APP_NAME    = 'RecebaBem'
export const APP_VERSION = '0.1.0'
export const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Gamificação ──────────────────────────────────────────────────────────────

/** Pontos concedidos por tipo de evento */
export const POINTS = {
  MISSION_COMPLETE: 10,   // base — pode ser sobrescrito por mission.points_reward
  STREAK_BONUS_7D:  50,   // bônus ao completar 7 dias seguidos
  STREAK_BONUS_30D: 200,  // bônus ao completar 30 dias seguidos
  BADGE_EARNED:     25,   // bônus ao desbloquear uma badge
} as const

/** Dias sem atividade para perder o streak */
export const STREAK_GRACE_DAYS = 1

/** Máximo de missões por sessão antes de mostrar tela de pausa */
export const MAX_MISSIONS_PER_SESSION = 10

// ─── Paginação ────────────────────────────────────────────────────────────────

export const PAGE_SIZE_DEFAULT   = 20
export const PAGE_SIZE_EMPLOYEES = 50
export const PAGE_SIZE_INVOICES  = 30

// ─── Roles ────────────────────────────────────────────────────────────────────

export const ROLES = {
  EMPLOYEE:    'employee',
  MANAGER:     'manager',
  HOTEL_ADMIN: 'hotel_admin',
  SUPER_ADMIN: 'super_admin',
} as const

export const ROLE_LABELS: Record<string, string> = {
  employee:    'Funcionário',
  manager:     'Gerente',
  hotel_admin: 'Admin do Hotel',
  super_admin: 'Super Admin',
}

// ─── Setores ─────────────────────────────────────────────────────────────────

export const SECTORS = [
  { value: 'recepcao',   label: 'Recepção' },
  { value: 'governanca', label: 'Governança' },
  { value: 'ab',         label: 'Alimentos & Bebidas' },
  { value: 'turismo',    label: 'Turismo Local' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'geral',      label: 'Geral' },
] as const

// ─── Planos ───────────────────────────────────────────────────────────────────

export const PLAN_SLUGS = {
  TRIAL:        'trial',
  ESSENCIAL:    'essencial',
  PROFISSIONAL: 'profissional',
  PREMIUM:      'premium',
} as const

// ─── Status ───────────────────────────────────────────────────────────────────

export const CERTIFICATE_STATUS = {
  PENDING: 'pending',
  ISSUED:  'issued',
  REVOKED: 'revoked',
} as const

export const SUBSCRIPTION_STATUS = {
  TRIAL:     'trial',
  ACTIVE:    'active',
  OVERDUE:   'overdue',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
} as const

// ─── Missões ─────────────────────────────────────────────────────────────────

export const MISSION_TYPES = [
  { value: 'listen_repeat',   label: 'Ouvir e Repetir' },
  { value: 'listen_identify', label: 'Ouça e Identifique' },
  { value: 'quiz',            label: 'Quiz' },
  { value: 'simulation',      label: 'Simulação' },
  { value: 'match_pairs',     label: 'Caça-par' },
  { value: 'fill_blank',      label: 'Preencher Lacuna' },
  { value: 'word_order',      label: 'Ordenar Palavras' },
] as const

// ─── PWA / Notificações ───────────────────────────────────────────────────────

export const PUSH_NOTIFICATION_ICON = '/icons/icon-192x192.png'
export const PUSH_NOTIFICATION_BADGE = '/icons/badge-72x72.png'

// ─── Navegação por role ───────────────────────────────────────────────────────

export const NAV_EMPLOYEE = [
  { href: '/inicio',       label: 'Início',      icon: 'Home' },
  { href: '/trilhas',      label: 'Trilhas',     icon: 'BookOpen' },
  { href: '/conquistas',   label: 'Conquistas',  icon: 'Trophy' },
  { href: '/ranking',      label: 'Ranking',     icon: 'BarChart2' },
  { href: '/certificados', label: 'Certificados',icon: 'Award' },
] as const

export const NAV_MANAGER = [
  { href: '/gerente/painel',         label: 'Painel',        icon: 'LayoutDashboard' },
  { href: '/gerente/funcionarios',   label: 'Funcionários',  icon: 'Users' },
  { href: '/gerente/relatorios',     label: 'Relatórios',    icon: 'BarChart2' },
  { href: '/gerente/configuracoes',  label: 'Configurações', icon: 'Settings' },
] as const

export const NAV_ADMIN = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: 'LayoutDashboard' },
  { href: '/admin/hoteis',       label: 'Hotéis',       icon: 'Building2' },
  { href: '/admin/conteudo',     label: 'Conteúdo',     icon: 'BookOpen' },
  { href: '/admin/planos',       label: 'Planos',       icon: 'Layers' },
  { href: '/admin/certificados', label: 'Certificados', icon: 'Award' },
  { href: '/admin/financeiro',   label: 'Financeiro',   icon: 'CreditCard' },
] as const
