# Fluxo Git

## Formato de Mensagem de Commit
```
<tipo>: <descricao>

<corpo opcional>
```

Tipos: feat, fix, refactor, docs, test, chore, perf, ci

Nota: Atribuicao desabilitada globalmente via ~/.claude/settings.json.

## Fluxo de Pull Request

Ao criar PRs:
1. Analisar historico completo de commits (nao apenas o ultimo)
2. Usar `git diff [base-branch]...HEAD` para ver todas as mudancas
3. Redigir resumo abrangente do PR
4. Incluir plano de testes com TODOs
5. Push com flag `-u` se for branch nova

> Para o processo completo de desenvolvimento (planejamento, TDD, code review) antes das operacoes git,
> veja [development-workflow.md](./development-workflow.md).
