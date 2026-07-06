/**
 * Server Actions para gestão de conteúdo (super_admin).
 */
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── createTrack ─────────────────────────────────────────────────────────────

const trackSchema = z.object({
  name:        z.string().min(2, 'Nome obrigatório.').max(100),
  icon:        z.string().max(10).default('📚'),
  level:       z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string().max(500).optional(),
})

export async function createTrack(args: {
  name:        string
  icon:        string
  level:       string
  description?: string
}) {
  const parsed = trackSchema.safeParse(args)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const { name, icon, level, description } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false, error: 'Sem permissão.' }

  // Gera slug a partir do nome
  const slug = name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { error } = await supabase.from('tracks').insert({
    name,
    slug,
    icon,
    level,
    description: description || null,
    active:      false, // inativa por padrão — admin ativa depois
    order_index: 999,   // fica no fim da lista
  })

  if (error) {
    if (error.message.includes('slug')) return { success: false, error: 'Já existe uma trilha com nome similar.' }
    return { success: false, error: 'Erro ao criar trilha.' }
  }

  revalidatePath('/admin/conteudo')
  return { success: true, slug }
}

// ─── toggleActive ─────────────────────────────────────────────────────────────

interface ToggleArgs {
  table:  'tracks' | 'modules' | 'missions'
  id:     string
  active: boolean
}

/** Ativa ou desativa uma trilha, módulo ou missão. */
export async function toggleActive({ table, id, active }: ToggleArgs) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false }

  const { error } = await supabase
    .from(table)
    .update({ active })
    .eq('id', id)

  if (error) return { success: false }

  revalidatePath('/admin/conteudo')
  return { success: true }
}

interface CreateMissionArgs {
  moduleId:     string
  name:         string
  type:         string
  pointsReward: number
  content:      Record<string, unknown>
  orderIndex:   number
}

/** Cria uma nova missão para um módulo. */
export async function createMission({
  moduleId, name, type, pointsReward, content, orderIndex,
}: CreateMissionArgs) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado.' }

  const { data: role } = await supabase.rpc('get_my_role')
  if (role !== 'super_admin') return { success: false, error: 'Sem permissão.' }

  const { error } = await supabase.from('missions').insert({
    module_id:     moduleId,
    name,
    type,
    points_reward: pointsReward,
    content,
    order_index:   orderIndex,
    active:        true,
  })

  if (error) return { success: false, error: 'Erro ao criar missão.' }

  revalidatePath('/admin/conteudo')
  return { success: true }
}
