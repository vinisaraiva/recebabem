# RecebaBem — Planos de Melhoria

Última atualização: 2026-07-06 (auditoria 4)  
Escopo: todos os arquivos `.ts` / `.tsx` exceto `node_modules` e `.next`

---

## Status dos Planos

| Arquivo | Título | Status | Prioridade |
|---------|--------|--------|------------|
| [001-pontos-duplicados.md](001-pontos-duplicados.md) | Deduplicar points_ledger (upsert idempotente) | ✅ CONCLUÍDO | 🔴 CRÍTICO |
| [002-attempts-increment.md](002-attempts-increment.md) | Incrementar attempts via SQL RPC | ✅ CONCLUÍDO | 🟡 MÉDIO |
| [003-points-aggregate.md](003-points-aggregate.md) | Soma de pontos via SQL aggregate | ✅ CONCLUÍDO | 🟡 MÉDIO |
| [004-gamification-triggers.md](004-gamification-triggers.md) | Verificar triggers de gamificação no DB | ✅ CONCLUÍDO | 🔴 CRÍTICO |
| [005-validacao-server-actions.md](005-validacao-server-actions.md) | Zod em todas as Server Actions críticas | ✅ CONCLUÍDO | 🟠 IMPORTANTE |
| [006-activity-log-accumulation.md](006-activity-log-accumulation.md) | activity_log acumulação via SQL RPC | ✅ CONCLUÍDO | 🟡 MÉDIO |
| [007-invitation-role-check.md](007-invitation-role-check.md) | Role check em createInvitation | ✅ CONCLUÍDO | 🟠 IMPORTANTE |
| [008-dead-code-removal.md](008-dead-code-removal.md) | Remover buildNextUrl morto em MissionPlayer | ✅ CONCLUÍDO | 🟢 BAIXO |
| [009-middleware-role-cache.md](009-middleware-role-cache.md) | Cache de getUserRole no middleware | ⚪ REJEITADO | — |
| [010-relatorios-n1.md](010-relatorios-n1.md) | Relatórios usa hotel_rankings view | ✅ CONCLUÍDO | 🟡 MÉDIO |
| [011-idor-hotel-settings.md](011-idor-hotel-settings.md) | IDOR em saveHotelSettings | ✅ CONCLUÍDO | 🔴 CRÍTICO |
| [012-loading-error-boundaries.md](012-loading-error-boundaries.md) | loading.tsx + error.tsx nos 3 route groups | ✅ CONCLUÍDO | 🟡 MÉDIO |
| [013-react-key-instability.md](013-react-key-instability.md) | key={emp.name} → key={emp.profile_id} | ✅ CONCLUÍDO | 🟢 BAIXO |
| [014-ignoreBuildErrors.md](014-ignoreBuildErrors.md) | Remover ignoreBuildErrors / ignoreDuringBuilds | ✅ CONCLUÍDO | 🟡 MÉDIO |
| [015-dead-links-conteudo.md](015-dead-links-conteudo.md) | Criar páginas nova-trilha e nova-missao | ✅ CONCLUÍDO | 🔴 ALTO |
| [016-ranking-visible.md](016-ranking-visible.md) | ranking_visible ignorado pela /ranking page | ✅ CONCLUÍDO | 🟡 MÉDIO |
| [017-update-hotel-zod.md](017-update-hotel-zod.md) | Zod em updateHotel | ✅ CONCLUÍDO | 🟢 BAIXO |
| [018-dead-prop-hotel-id.md](018-dead-prop-hotel-id.md) | Prop hotelId morta em HotelSettingsForm | ✅ CONCLUÍDO | 🟢 BAIXO |

---

## Achados Rejeitados

- **009 — getUserRole duplo no middleware**: Análise mais cuidadosa mostrou que os dois `if`-branches são mutuamente exclusivos — cada request faz exatamente uma chamada. Não é double-call.
- **hotel_tracks sem hotel_id explícito** — por design; RLS da view filtra por hotel.
- **Sem testes automatizados** — fora do escopo atual; requer setup de infraestrutura (Vitest + Supabase local).
- **createMission content sem Zod** — super_admin-only, risco baixo. Validação de schema por tipo de missão pode ser adicionada futuramente.
