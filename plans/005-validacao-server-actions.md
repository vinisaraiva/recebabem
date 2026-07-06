# 005 — Validação Zod nas Server Actions + habilitar TypeScript no build

**Categoria:** Segurança / Tech Debt  
**Impacto:** MÉDIO — inputs de Server Actions chegam sem validação de tipo ou shape. Um usuário mal-intencionado pode enviar `missionId` de outra instalação ou `score` arbitrário. O RLS do Supabase é a última barreira, mas defesa em profundidade exige validação na borda do servidor.  
**Esforço:** Médio (M)  
**Risco do fix:** Baixo — apenas adiciona validações que rejeitas entradas inválidas mais cedo.

---

## Evidência

**Zod está instalado** (`package.json`) mas **só é usado no cliente** (`ConviteForm.tsx`). Nenhuma Server Action valida seus inputs com Zod.

**`lib/actions/missions.ts`:**
```ts
export async function completeMission({ missionId, score, correct }: CompleteMissionArgs) {
  // Nenhuma validação — missionId poderia ser UUID de outro hotel
  const supabase = await createClient()
  ...
  await supabase.from('missions').select(...).eq('id', missionId) // confia no input
```

**`lib/actions/admin-content.ts`:**
```ts
export async function createMission({ moduleId, name, type, pointsReward, content, orderIndex }) {
  // content: Record<string, unknown> — aceita qualquer JSON
```

**`next.config.mjs`:**
```ts
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```

---

## Passos

### Passo 1 — Criar arquivo de schemas compartilhados

Crie o arquivo `lib/validations/index.ts`:

```ts
/**
 * Schemas Zod para validação de inputs nas Server Actions.
 * Sempre use .safeParse() — não .parse() — para evitar exceções não tratadas.
 */
import { z } from 'zod'

export const uuidSchema = z.string().uuid('ID inválido')

export const completeMissionSchema = z.object({
  missionId: z.string().uuid('missionId inválido'),
  score:     z.number().int().min(0).max(100),
  correct:   z.boolean(),
})

export const createMissionSchema = z.object({
  moduleId:     z.string().uuid(),
  name:         z.string().min(1).max(200),
  type:         z.enum(['listen_repeat', 'listen_identify', 'quiz', 'simulation', 'match_pairs', 'fill_blank', 'word_order']),
  pointsReward: z.number().int().min(1).max(100),
  content:      z.record(z.unknown()),
  orderIndex:   z.number().int().min(1),
})

export const issueCertificateSchema = z.object({
  certificateId:  z.string().uuid(),
  certificateUrl: z.string().url().startsWith('https://'),
  notes:          z.string().max(500).optional(),
})
```

### Passo 2 — Adicionar validação em `completeMission`

Arquivo: `lib/actions/missions.ts`

Adicione import no topo:
```ts
import { completeMissionSchema } from '@/lib/validations'
```

No início de `completeMission`, antes de qualquer outra coisa:
```ts
export async function completeMission(args: CompleteMissionArgs) {
  const parsed = completeMissionSchema.safeParse(args)
  if (!parsed.success) {
    console.error('completeMission: input inválido', parsed.error.flatten())
    return { success: false }
  }
  const { missionId, score, correct } = parsed.data
  // ... resto do código usa parsed.data, não os args originais
```

### Passo 3 — Adicionar validação em `createMission`

Arquivo: `lib/actions/admin-content.ts`

```ts
import { createMissionSchema } from '@/lib/validations'

export async function createMission(args: CreateMissionArgs) {
  const parsed = createMissionSchema.safeParse(args)
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' }
  const { moduleId, name, type, pointsReward, content, orderIndex } = parsed.data
  // ... resto
```

### Passo 4 — Adicionar validação em `issueCertificate`

Arquivo: `lib/actions/admin-certificates.ts`

```ts
import { issueCertificateSchema } from '@/lib/validations'

export async function issueCertificate(args: IssueArgs) {
  const parsed = issueCertificateSchema.safeParse(args)
  if (!parsed.success) return { success: false, error: 'Dados inválidos.' }
  const { certificateId, certificateUrl, notes } = parsed.data
  // ... resto
```

### Passo 5 — Re-habilitar TypeScript e ESLint no build

Arquivo: `next.config.mjs`

**Antes:**
```ts
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```

**Depois:**
```ts
// typescript e eslint com config padrão (erros bloqueiam o build)
// typescript: { ignoreBuildErrors: false },  // padrão — pode remover a linha
// eslint: { ignoreDuringBuilds: false },      // padrão — pode remover a linha
```

Simplesmente **remova** as duas linhas — o padrão do Next.js já é `false`.

**Depois de remover, execute:**
```bash
npx tsc --noEmit
```

Corrija todos os erros TypeScript que aparecerem antes de executar `npx next build`. Espere erros relacionados a tipos `Json` do Supabase e a `Record<string, unknown>` — a maioria será adição de type assertions ou tipos explícitos.

### Passo 6 — Build final

```bash
npx next build
# Deve completar sem nenhum erro de TS ou ESLint
```

---

## Critérios de Conclusão

- [ ] `lib/validations/index.ts` existe com os três schemas
- [ ] `completeMission` chama `safeParse` antes de qualquer acesso ao banco
- [ ] `createMission` chama `safeParse` antes de qualquer acesso ao banco
- [ ] `issueCertificate` chama `safeParse` e rejeita URLs não-HTTPS
- [ ] `ignoreBuildErrors` e `ignoreDuringBuilds` removidos de `next.config.mjs`
- [ ] `npx tsc --noEmit` passa sem erros
- [ ] `npx next build` passa sem erros

---

## Nota de Manutenção

Toda vez que adicionar uma nova Server Action que recebe input do browser, crie o schema Zod em `lib/validations/index.ts` e valide no início da action. Inputs que parecem "só vir do frontend nosso" podem ser interceptados — sempre valide no servidor.
