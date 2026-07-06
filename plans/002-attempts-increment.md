# 002 — Incrementar `attempts` corretamente

**Categoria:** Bug / Correctness  
**Impacto:** MÉDIO — o campo `attempts` em `mission_progress` sempre fica em 1, independente de quantas vezes o funcionário tentou. Relatórios de dificuldade por missão ficam inúteis.  
**Esforço:** Pequeno (S)  
**Risco do fix:** Baixo — mudança cirúrgica no upsert.

---

## Evidência

**`lib/actions/missions.ts`, linhas 32–42:**
```ts
await supabase.from('mission_progress').upsert(
  {
    profile_id:   user.id,
    mission_id:   missionId,
    status:       correct ? 'completed' : 'attempted',
    score:        correct ? score : 0,
    completed_at: correct ? new Date().toISOString() : null,
    attempts:     1, // será somado via trigger ou update
  },
  {
    onConflict: 'profile_id,mission_id',
    ignoreDuplicates: false,
  }
)
```

O comentário "será somado via trigger" não existe na prática. Com `ignoreDuplicates: false`, o upsert sobrescreve **todos** os campos — incluindo `attempts: 1`. Cada nova tentativa volta `attempts` para 1.

---

## Contexto do Repositório

- Arquivo a modificar: `lib/actions/missions.ts`
- O campo `attempts` existe na tabela `mission_progress` (tipo `integer`, default 0 ou 1)
- Supabase suporta expressões SQL no update via `.update()` separado, mas não em upsert direto
- Padrão recomendado: split em `upsert` para insert + `update` com `attempts = attempts + 1` para o caso de conflito

---

## Passos

### Passo 1 — Substituir o upsert único por insert + update condicional

Arquivo: `lib/actions/missions.ts`

**Antes** (linhas 32–42):
```ts
await supabase.from('mission_progress').upsert(
  {
    profile_id:   user.id,
    mission_id:   missionId,
    status:       correct ? 'completed' : 'attempted',
    score:        correct ? score : 0,
    completed_at: correct ? new Date().toISOString() : null,
    attempts:     1, // será somado via trigger ou update
  },
  {
    onConflict: 'profile_id,mission_id',
    ignoreDuplicates: false,
  }
)
```

**Depois:**
```ts
// Tenta inserir; se já existe (onConflict) ignora sem erro
await supabase.from('mission_progress').upsert(
  {
    profile_id:   user.id,
    mission_id:   missionId,
    status:       correct ? 'completed' : 'attempted',
    score:        correct ? score : 0,
    completed_at: correct ? new Date().toISOString() : null,
    attempts:     1,
  },
  {
    onConflict:      'profile_id,mission_id',
    ignoreDuplicates: true,   // insert only if new
  }
)

// Sempre incrementa attempts e atualiza status/score se necessário
await supabase
  .from('mission_progress')
  .update({
    attempts:     supabase.rpc('increment_attempts', { row_profile_id: user.id, row_mission_id: missionId }) as unknown as number,
    status:       correct ? 'completed' : 'attempted',
    score:        correct ? score : 0,
    completed_at: correct ? new Date().toISOString() : null,
  })
  .eq('profile_id', user.id)
  .eq('mission_id',  missionId)
```

> **Atenção:** A abordagem acima com RPC para incremento é complexa. Use o caminho mais simples abaixo.

### Passo 1 (alternativa mais simples) — Função SQL UPSERT atômica

No Supabase Dashboard → SQL Editor, crie uma função:

```sql
CREATE OR REPLACE FUNCTION upsert_mission_progress(
  p_profile_id   uuid,
  p_mission_id   uuid,
  p_status       text,
  p_score        integer,
  p_completed_at timestamptz
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO mission_progress (profile_id, mission_id, status, score, completed_at, attempts)
  VALUES (p_profile_id, p_mission_id, p_status, p_score, p_completed_at, 1)
  ON CONFLICT (profile_id, mission_id)
  DO UPDATE SET
    attempts     = mission_progress.attempts + 1,
    status       = EXCLUDED.status,
    score        = CASE WHEN EXCLUDED.score > mission_progress.score
                        THEN EXCLUDED.score
                        ELSE mission_progress.score END,
    completed_at = COALESCE(EXCLUDED.completed_at, mission_progress.completed_at),
    updated_at   = now();
END;
$$;
```

Depois substitua o upsert em `lib/actions/missions.ts`:

```ts
await supabase.rpc('upsert_mission_progress', {
  p_profile_id:   user.id,
  p_mission_id:   missionId,
  p_status:       correct ? 'completed' : 'attempted',
  p_score:        correct ? score : 0,
  p_completed_at: correct ? new Date().toISOString() : null,
})
```

**Verificação do passo 1:**
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'upsert_mission_progress';
-- Deve retornar 1 linha
```

### Passo 2 — Verificação do build

```bash
npx next build
# Deve terminar sem erros
```

---

## Critérios de Conclusão

- [ ] Função `upsert_mission_progress` existe no banco
- [ ] `lib/actions/missions.ts` chama `supabase.rpc('upsert_mission_progress', ...)` em vez do upsert direto
- [ ] Após duas tentativas na mesma missão, `SELECT attempts FROM mission_progress WHERE mission_id = '...'` retorna 2
- [ ] `npx next build` sem erros

---

## Nota de Manutenção

A lógica de `score` na função SQL preserva o maior score já obtido. Se a regra de negócio mudar para "sempre sobrescrever com o score mais recente", altere `CASE WHEN...` para `EXCLUDED.score`.
