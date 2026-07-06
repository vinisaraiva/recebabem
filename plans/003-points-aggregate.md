# 003 — Soma de pontos via SQL aggregate

**Categoria:** Performance  
**Impacto:** MÉDIO — a página `/inicio` busca **todas** as linhas de `points_ledger` do usuário e soma no JavaScript. Com uso intenso (centenas de missões completadas), isso vira um problema de latência e consumo de bandwidth.  
**Esforço:** Pequeno (S)  
**Risco do fix:** Baixo — só muda a query; zero impacto em lógica de negócio.

---

## Evidência

**`app/(employee)/inicio/page.tsx`, linhas 37–40:**
```ts
const { data: pointsData } = await supabase
  .from('points_ledger')
  .select('amount')
  .eq('profile_id', user.id)

const totalPoints = (pointsData ?? []).reduce((sum, r) => sum + r.amount, 0)
```

Busca N linhas e soma no servidor Node.js. O correto é deixar o PostgreSQL fazer `SUM()`.

---

## Contexto do Repositório

- Arquivo a modificar: `app/(employee)/inicio/page.tsx`
- Supabase suporta aggregate functions via `.select('amount.sum()')` (PostgREST syntax)
- Padrão existente no projeto: queries com `.select()` simples (sem aggregates ainda)

---

## Passos

### Passo 1 — Substituir a query de pontos

Arquivo: `app/(employee)/inicio/page.tsx`

**Antes** (linhas 37–40 + linha ~47):
```ts
const { data: pointsData } = await supabase
  .from('points_ledger')
  .select('amount')
  .eq('profile_id', user.id)

// (mais abaixo, linha ~47)
const totalPoints = (pointsData ?? []).reduce((sum, r) => sum + r.amount, 0)
```

**Depois** — mova para dentro do `Promise.all` existente (linhas 21–39) como 4º item:
```ts
const [profileRes, streakRes, trackProgressRes, pointsRes] = await Promise.all([
  supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single(),

  supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('profile_id', user.id)
    .maybeSingle(),

  supabase
    .from('track_progress')
    .select(`completion_pct, started_at, tracks ( name, icon, color, slug )`)
    .eq('profile_id', user.id)
    .lt('completion_pct', 100)
    .order('updated_at', { ascending: false })
    .limit(3),

  // 4º — aggregate no DB, zero rows transferidas
  supabase
    .from('points_ledger')
    .select('amount.sum()')
    .eq('profile_id', user.id)
    .single(),
])
```

Remova o bloco `const { data: pointsData }` que fica logo após o `Promise.all`.

Atualize a linha que extrai `totalPoints`:
```ts
const totalPoints = (pointsRes.data as { sum: number } | null)?.sum ?? 0
```

**Não altere** nenhuma outra parte do arquivo.

### Passo 2 — Verificação

```bash
npx next build
# Sem erros
```

Teste manual: acesse `/inicio` e confirme que os pontos exibidos são os mesmos de antes.

---

## Critérios de Conclusão

- [ ] Nenhum `.reduce()` sobre `points_ledger` em `inicio/page.tsx`
- [ ] A query usa `'amount.sum()'` e retorna um único objeto `{ sum: number }`
- [ ] A query está dentro do `Promise.all` (executa em paralelo com as outras)
- [ ] `npx next build` sem erros
- [ ] Pontos exibidos em `/inicio` batem com o total real

---

## Nota de Manutenção

Se no futuro for criada uma página de histórico de pontos (por missão, por data), essa página sim pode precisar de todas as linhas. Para `/inicio` o aggregate é sempre suficiente.
