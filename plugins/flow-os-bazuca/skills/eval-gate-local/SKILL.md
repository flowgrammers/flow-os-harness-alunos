---
name: "eval-gate-local"
description: "Gate de eval executado PELA SESSÃO Claude Code como juiz (REQ-175, gap G2) — substitui o disparo manual do eval-gate.yml e o juiz via OpenRouter ($) pelo julgamento in-session (plano Max, custo zero). Use OBRIGATORIAMENTE antes de commitar mudança em: prompts de agents (~/.claude/agents), rubricas de eval (scripts/eval/), skills que geram output avaliado, ou o juiz LLM. Fluxo: buscar golden set → julgar cada cenário contra a rubrica → comparar com a última run → gravar em eval_runs (judge=claude-code). Regressão de score = NÃO commitar. Também acionável por 'rodar eval gate', 'golden set', 'a mudança de prompt regrediu?'."
agents:
  - claude-code
triggers:
  - eval gate
  - golden set
  - mudança de prompt
version: "1.0"
origin: REQ-175 (gap G2, evals Claude-native 2026-07-18)
---

# Eval Gate Local — a sessão julga o golden set

Prompt é código: mudança sem eval verde não deveria chegar ao master. O gate agora roda AQUI, sem depender de workflow manual nem de key de API.

## Onde mora a baseline — dois trilhos

| O que mudou | Onde está a baseline | Quem julga |
|---|---|---|
| **Artefato do harness** — skill, agent, hook, command em `~/.claude` | **`evals.json` versionado ao lado do artefato** | runner (determinístico) ou esta sessão (comportamental) |
| Agente com dataset no banco | `eval_datasets` / `eval_scenarios` no Supabase | esta sessão, protocolo abaixo |
| Feature de projeto (build/unit/E2E) | `docs/testes/<slug>-ia.md` do projeto | não é este gate — ver `docs/testes/PADRAO-VALIDACAO.md` |

**A baseline não pode morrer no scratchpad.** Em 2026-08-07 o runner dos 29 cenários do modo
CMMI foi escrito, rodou verde, virou tabela em prosa — e sumiu. Na mudança seguinte não havia
o que rodar. Regra que decorre disso: **eval determinístico tem runner commitado, sempre.**

### Convenção `evals.json`

Fica dentro de diretório já versionado, sem inventar pasta nova na raiz:

| Alvo | Caminho |
|---|---|
| skill | `skills/<nome>/evals.json` |
| agent | `agents/evals/<nome>.json` |
| hook | `scripts/hooks/evals/<nome>.json` |
| command | `commands/evals/<nome>.json` |

```json
{
  "target": "cmmi-gate",
  "kind": "hook",
  "path": "scripts/hooks/cmmi-gate.js",
  "runner": "scripts/hooks/evals/run-hook-evals.js",
  "baseline": { "date": "2026-08-07", "result": "10/10 PASS", "evidence": "<doc de teste>" },
  "evals": [
    { "id": "G4", "type": "deterministic",
      "scenario": "...", "why": "por que este caso importa",
      "fixture": { "claude_md": "...", "env": {}, "stdin": {} },
      "expect": { "exit": 2, "stderr_matches": ["DoR"], "stderr_not_matches": ["report-only"] } },
    { "id": "B1", "type": "behavioral",
      "scenario": "...", "prompt": "...", "expected_output": "...", "anchor": "..." }
  ]
}
```

- `type: deterministic` → roda por runner. Para hooks, o runner **já existe e é genérico**:
  `node scripts/hooks/evals/run-hook-evals.js [alvo]`. Adicionar cenário é **editar JSON**,
  não escrever runner novo — foi assim que se perdeu a baseline anterior.
- `type: behavioral` → julgado por esta sessão, com o mesmo rigor do protocolo abaixo
  (score por critério, `reason` citando evidência do output, postura adversarial).
- `why` é obrigatório: cenário sem motivo declarado é o primeiro a ser deletado quando
  incomoda, e o segundo a virar bug.
- **Runner novo tem que reprovar antes de valer.** Suíte que passa de primeira não prova nada:
  mute uma expectativa, confirme o vermelho, restaure. Só então a baseline conta.

## Protocolo

1. **Buscar o golden set** (imprime JSON com cenários + rubricas):
   ```bash
   node scripts/eval/eval-local-fetch.js [--dataset=nome] [--agent=agent_ref]
   ```
2. **Julgar cada cenário** — você é o juiz:
   - Leia `input`, `expected_output` e `rubric` (JSONB com critérios).
   - Gere a resposta do agente-alvo quando o cenário exigir execução, OU avalie o output registrado, conforme o tipo do cenário.
   - Score 0-1 por métrica da rubrica, com `reason` de 1-2 frases **citando evidência do output** (nunca "parece bom").
   - Postura adversarial: default é reprovar; aprovação exige a rubrica satisfeita ponto a ponto.
3. **Montar o arquivo de julgamentos** (no scratchpad da sessão):
   ```json
   {
     "agent_name": "<agente avaliado>",
     "dataset_id": "<uuid do dataset>",
     "judge_model": "claude-code-session/<modelo da sessão>",
     "judgments": [
       { "scenario_id": "<uuid>", "metric": "g_eval_correctness", "score": 0.8, "reason": "..." }
     ]
   }
   ```
4. **Gravar** (cria eval_run com judge_provider=claude-code, custo $0):
   ```bash
   node scripts/eval/eval-local-save.js <judgments.json>
   ```
5. **Comparar com a baseline**: consultar a run anterior do mesmo agente em `eval_runs` (score_total). Queda além de -0,05 = **regressão → não commitar**; investigar antes.
6. Resultado aparece na aba Agêntico de `/evals` no dashboard, junto das runs por OpenRouter.

## Limites honestos deste juiz

- **Viés de auto-avaliação**: a sessão pode estar julgando prompt que ela mesma editou. Mitigações obrigatórias: rubrica ponto a ponto (não impressão geral), evidência citada em cada reason, e comparação numérica com a baseline — não com a memória.
- **Calibração continua valendo**: o F6 do V12 mediu juízes contra rótulos humanos (κ). Periodicamente rode `npm run eval:calibrate` incluindo runs `judge_provider=claude-code` — se o κ da sessão for pior que o do Haiku, este gate volta a ser advisory.
- Cenários multimodais ou multiturno longos: use o runner Python (`npm run eval:*`) — este gate local cobre o caso comum (single-turn, rubrica textual).

## Roteamento de juiz (ADR-009)

**Se um humano está na sessão, o juiz é a sessão ($0, plano Max). Se ninguém está olhando — rotinas n8n, cron, CI headless — o juiz é OpenRouter** via aliases, com provisioning key própria e budget (weekly digest, eval-online/drift, red team periódico). Nunca comparar baseline entre `judge_provider` diferentes — são distribuições distintas; comparar sempre dentro do mesmo juiz.
