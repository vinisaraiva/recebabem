# 001 — Deduplicar points_ledger

**Categoria:** Bug / Correctness  
**Impacto:** ALTO — qualquer double-click, retry de rede ou chamada duplicada ao `completeMission` insere dois registros de pontos para a mesma missão. O usuário ganha pontos em dobro sem qualquer restrição.  
**Esforço:** Pequeno (S)  
**Risco do fix:** Baixo — apenas adiciona restrição e muda `insert` para `upsert` idempotente.

---

## Evidência

**`lib/actions/missions.ts`, linha 50:**
```ts
await supabase.from('points_ledger').insert({
  profile_id: user.id,
  hotel_id:   hotelId,
  mission_id: missionId,
  amount:     mission.points_reward,
  reason:     'mission_completed',
})
```

Chamada plain `.insert()` sem nenhuma proteção de duplicidade. Se o servidor receber a mesma requisição duas vezes (double-click no botão, retry do service worker, perda e re-conexão de rede), dois registros são inseridos e o total de pontos dobra.

---

## Contexto do Repositório

- Framework: Next.js 14 App Router, TypeScript, Supabase
- Convenção: mutations em `lib/actions/*.ts` com `'use server'`
- DB: Supabase/PostgreSQL — suporta `upsert` com `onConflict`
- Arquivo a modificar: `lib/actions/missions.ts`
- Arquivo de referência (padrão existente): `lib/actions/missions.ts` já usa upsert em `mission_progress` (linha 32) e `activity_log` (linha 60) — siga o mesmo padrão

---

## Passos

### Passo 1 — Adicionar constraint UNIQUE no banco

No Supabase Dashboard → SQL Editor, execute:

```sql
-- Garante que cada (profile_id, mission_id) aparece no máximo uma vez
-- por motivo de missão concluída.
ALTER TABLE points_ledger
  ADD CONSTRAINT points_ledger_mission_unique
  UNIQUE (profile_id, mission_id, reason)
  WHERE reason = 'mission_completed';
```

> **Se já existir dados duplicados**, limpe antes:
> ```sql
> DELETE FROM points_ledger a
> USING points_ledger b
> WHERE a.id > b.id
>   AND a.profile_id = b.profile_id
>   AND a.mission_id = b.mission_id
>   AND a.reason = 'mission_completed';
> ```
> Depois execute o ALTER TABLE.

**Verificação do passo 1:**
```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'points_ledger'
  AND constraint_type = 'UNIQUE';
-- Deve retornar: points_ledger_mission_unique
```

### Passo 2 — Trocar `insert` por `upsert` em `lib/actions/missions.ts`

Arquivo: `lib/actions/missions.ts`

Localize (linha ~50):
```ts
await supabase.from('points_ledger').insert({
  profile_id: user.id,
  hotel_id:   hotelId,
  mission_id: missionId,
  amount:     mission.points_reward,
  reason:     'mission_completed',
})
```

Substitua por:
```ts
await supabase.from('points_ledger').upsert(
  {
    profile_id: user.id,
    hotel_id:   hotelId,
    mission_id: missionId,
    amount:     mission.points_reward,
    reason:     'mission_completed',
  },
  {
    onConflict:      'profile_id,mission_id,reason',
    ignoreDuplicates: true,   // segunda chamada é silenciosamente ignorada
  }
)
```

**Não altere** nenhuma outra parte do arquivo. O `upsert` de `mission_progress` e `activity_log` logo abaixo já está correto.

### Passo 3 — Verificação local

```bash
cd recebabem
npx next build
# Deve terminar sem erros
```

---

## Critérios de Conclusão

- [ ] Constraint `points_ledger_mission_unique` existe no banco (verificar via SQL acima)
- [ ] `lib/actions/missions.ts` usa `upsert` com `ignoreDuplicates: true` para `points_ledger`
- [ ] `npx next build` termina sem erros

---

## Nota de Manutenção

Se no futuro for criada a funcionalidade de **refazer uma missão já concluída** e o usuário puder ganhar pontos novamente, o `ignoreDuplicates: true` precisará ser revisado. Nesse caso, pode-se mudar `reason` para incluir um timestamp de sessão, ou adicionar um campo `session_id` ao ledger.
