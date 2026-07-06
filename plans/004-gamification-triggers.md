# 004 — Verificar e criar triggers de gamificação

**Categoria:** Bug / Correctness  
**Impacto:** ALTO — sem os triggers corretos no banco, as seguintes features ficam completamente quebradas:
  - Barra de progresso do módulo sempre 0%
  - Streak sempre 0 dias (nunca incrementa)
  - Badges nunca concedidas (conquistas sempre vazias)
  - `track_progress.completion_pct` pode nunca atualizar

**Esforço:** Médio (M)  
**Risco do fix:** Médio — triggers são SQL; erros em triggers podem afetar writes no DB.  
**Confiança:** MÉDIA — o código não atualiza essas tabelas. Podem existir triggers no Supabase não visíveis no código. Verificação é obrigatória antes de implementar.

---

## Evidência

**`lib/actions/missions.ts`** — o `completeMission` atualiza apenas:
- `mission_progress` ✅
- `points_ledger` ✅
- `activity_log` ✅

**Não atualiza:**
- `module_progress` — a barra de progresso do módulo (`/trilhas/[slug]/modulos/[modSlug]`) busca este campo
- `track_progress` — progresso geral da trilha
- `streaks` — a página `/inicio` exibe `current_streak` desta tabela
- `employee_badges` — as conquistas nunca são concedidas pelo código

**`app/(employee)/inicio/page.tsx`, linha ~28:**
```ts
supabase
  .from('streaks')
  .select('current_streak, longest_streak, last_activity_date')
  .eq('profile_id', user.id)
  .maybeSingle()
```
Se a tabela `streaks` não tem um trigger atualizando-a a partir de `activity_log`, sempre retorna null → streak = 0.

**`app/(employee)/conquistas/page.tsx`, linha ~22:**
```ts
supabase
  .from('employee_badges')
  .select('badge_id, earned_at')
  .eq('profile_id', user.id)
```
Se não há trigger concedendo badges quando condições são atingidas, esta query sempre retorna vazia.

---

## Passos

### Passo 0 — VERIFICAR antes de tudo (obrigatório)

No Supabase Dashboard → Database → Triggers, verifique se existem triggers para:

```sql
-- Cole no SQL Editor para listar todos os triggers do projeto
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**Se existirem triggers para `mission_progress` ou `activity_log` que atualizam `module_progress`, `track_progress`, `streaks` e `employee_badges`:** o problema pode ser de outra natureza (trigger com bug). Investigue o corpo do trigger antes de criar um novo.

**Se NÃO existirem tais triggers:** execute os passos abaixo.

---

### Passo 1 — Trigger para `module_progress` e `track_progress`

No Supabase SQL Editor:

```sql
-- Função que recalcula module_progress e track_progress quando mission_progress muda
CREATE OR REPLACE FUNCTION update_progress_on_mission_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_module_id       uuid;
  v_track_id        uuid;
  v_total_missions  integer;
  v_done_missions   integer;
  v_module_pct      numeric;
  v_total_modules   integer;
  v_done_modules    integer;
  v_track_pct       numeric;
BEGIN
  -- Só processa quando status muda para 'completed'
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;
  IF OLD.status = 'completed' THEN
    RETURN NEW;  -- já estava concluída, sem mudança
  END IF;

  -- Busca module_id da missão
  SELECT module_id INTO v_module_id FROM missions WHERE id = NEW.mission_id;
  SELECT track_id  INTO v_track_id  FROM modules  WHERE id = v_module_id;

  -- Calcula completion_pct do módulo
  SELECT COUNT(*) INTO v_total_missions
    FROM missions WHERE module_id = v_module_id AND active = true;

  SELECT COUNT(*) INTO v_done_missions
    FROM mission_progress mp
    JOIN missions m ON m.id = mp.mission_id
    WHERE m.module_id = v_module_id
      AND mp.profile_id = NEW.profile_id
      AND mp.status = 'completed';

  v_module_pct := CASE WHEN v_total_missions > 0
                       THEN (v_done_missions::numeric / v_total_missions) * 100
                       ELSE 0 END;

  -- Upsert em module_progress
  INSERT INTO module_progress (profile_id, module_id, completion_pct, completed_at)
  VALUES (
    NEW.profile_id,
    v_module_id,
    v_module_pct,
    CASE WHEN v_module_pct >= 100 THEN now() ELSE null END
  )
  ON CONFLICT (profile_id, module_id)
  DO UPDATE SET
    completion_pct = EXCLUDED.completion_pct,
    completed_at   = COALESCE(EXCLUDED.completed_at, module_progress.completed_at),
    updated_at     = now();

  -- Calcula completion_pct da trilha
  SELECT COUNT(*) INTO v_total_modules
    FROM modules WHERE track_id = v_track_id AND active = true;

  SELECT COUNT(*) INTO v_done_modules
    FROM module_progress mp2
    JOIN modules m2 ON m2.id = mp2.module_id
    WHERE m2.track_id = v_track_id
      AND mp2.profile_id = NEW.profile_id
      AND mp2.completion_pct >= 100;

  v_track_pct := CASE WHEN v_total_modules > 0
                      THEN (v_done_modules::numeric / v_total_modules) * 100
                      ELSE 0 END;

  -- Upsert em track_progress
  INSERT INTO track_progress (profile_id, track_id, completion_pct, completed_at, started_at)
  VALUES (
    NEW.profile_id,
    v_track_id,
    v_track_pct,
    CASE WHEN v_track_pct >= 100 THEN now() ELSE null END,
    now()
  )
  ON CONFLICT (profile_id, track_id)
  DO UPDATE SET
    completion_pct = EXCLUDED.completion_pct,
    completed_at   = COALESCE(EXCLUDED.completed_at, track_progress.completed_at),
    updated_at     = now();

  RETURN NEW;
END;
$$;

-- Cria o trigger
DROP TRIGGER IF EXISTS trg_update_progress ON mission_progress;
CREATE TRIGGER trg_update_progress
  AFTER INSERT OR UPDATE ON mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_progress_on_mission_complete();
```

**Verificação do passo 1:**
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trg_update_progress';
-- Deve retornar 1 linha
```

---

### Passo 2 — Trigger para `streaks`

```sql
CREATE OR REPLACE FUNCTION update_streak_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_date   date;
  v_cur_streak  integer;
  v_long_streak integer;
BEGIN
  -- Busca streak atual
  SELECT current_streak, longest_streak, last_activity_date
    INTO v_cur_streak, v_long_streak, v_last_date
    FROM streaks
    WHERE profile_id = NEW.profile_id;

  IF NOT FOUND THEN
    -- Primeiro registro
    INSERT INTO streaks (profile_id, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.profile_id, 1, 1, NEW.activity_date);
    RETURN NEW;
  END IF;

  IF v_last_date = NEW.activity_date THEN
    RETURN NEW;  -- mesma data, já contada
  END IF;

  IF v_last_date = NEW.activity_date - interval '1 day' THEN
    -- Dia consecutivo
    v_cur_streak  := v_cur_streak + 1;
  ELSE
    -- Quebrou a sequência
    v_cur_streak  := 1;
  END IF;

  v_long_streak := GREATEST(v_cur_streak, v_long_streak);

  UPDATE streaks SET
    current_streak     = v_cur_streak,
    longest_streak     = v_long_streak,
    last_activity_date = NEW.activity_date,
    updated_at         = now()
  WHERE profile_id = NEW.profile_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_streak ON activity_log;
CREATE TRIGGER trg_update_streak
  AFTER INSERT ON activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_streak_on_activity();
```

**Verificação:**
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trg_update_streak';
```

---

### Passo 3 — Trigger para badges (simplificado)

> Este passo implementa apenas as condições de badge mais comuns. Adapte conforme as regras cadastradas na tabela `badges`.

```sql
CREATE OR REPLACE FUNCTION check_badges_on_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge RECORD;
  v_value numeric;
BEGIN
  -- Verifica cada badge ativa que o usuário ainda não tem
  FOR v_badge IN
    SELECT b.*
    FROM badges b
    WHERE b.active = true
      AND NOT EXISTS (
        SELECT 1 FROM employee_badges eb
        WHERE eb.profile_id = NEW.profile_id
          AND eb.badge_id   = b.id
      )
  LOOP
    v_value := 0;

    IF v_badge.condition_type = 'missions_completed' THEN
      SELECT COUNT(*) INTO v_value
        FROM mission_progress
        WHERE profile_id = NEW.profile_id AND status = 'completed';

    ELSIF v_badge.condition_type = 'streak_days' THEN
      SELECT current_streak INTO v_value
        FROM streaks WHERE profile_id = NEW.profile_id;

    ELSIF v_badge.condition_type = 'tracks_completed' THEN
      SELECT COUNT(*) INTO v_value
        FROM track_progress
        WHERE profile_id = NEW.profile_id AND completion_pct >= 100;
    END IF;

    IF v_value >= v_badge.condition_value THEN
      INSERT INTO employee_badges (profile_id, badge_id, earned_at)
      VALUES (NEW.profile_id, v_badge.id, now())
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_badges ON mission_progress;
CREATE TRIGGER trg_check_badges
  AFTER INSERT OR UPDATE ON mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_badges_on_progress();
```

**Verificação:**
```sql
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_name = 'trg_check_badges';
```

---

### Passo 4 — Teste end-to-end

1. Complete uma missão no app (`/trilhas/...`)
2. Consulte no banco:
```sql
-- Progresso do módulo deve ser > 0
SELECT completion_pct FROM module_progress WHERE profile_id = '<seu_user_id>';

-- Streak deve ser >= 1
SELECT current_streak FROM streaks WHERE profile_id = '<seu_user_id>';

-- Se tiver badge com condition_value = 1 (primeira missão):
SELECT * FROM employee_badges WHERE profile_id = '<seu_user_id>';
```

---

## Critérios de Conclusão

- [ ] Trigger `trg_update_progress` existe e dispara em `mission_progress`
- [ ] Trigger `trg_update_streak` existe e dispara em `activity_log`
- [ ] Trigger `trg_check_badges` existe e dispara em `mission_progress`
- [ ] Após completar uma missão, `module_progress.completion_pct` reflete o progresso real
- [ ] Após completar uma missão, `streaks.current_streak` é >= 1
- [ ] Badge com `condition_value = 1` é concedida na primeira missão completada

---

## Escape Hatch

Se ao executar o `SELECT trigger_name...` do Passo 0 você encontrar triggers existentes com nomes diferentes, **pare** e leia o corpo desses triggers antes de criar novos. Triggers duplicados para o mesmo evento podem causar inconsistências.

## Nota de Manutenção

Os triggers usam `SECURITY DEFINER` — executam com permissão do owner, contornando RLS. Isso é necessário porque triggers precisam escrever em tabelas que o usuário autenticado pode não ter permissão de `UPDATE` diretamente. Se a política de segurança mudar, revisite isso.
