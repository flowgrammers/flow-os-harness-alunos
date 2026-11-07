# Padroes de Code Review

## Proposito

Code review garante qualidade, seguranca e manutenibilidade antes do merge. Esta regra define quando e como conduzir reviews.

## Quando Revisar

**Gatilhos OBRIGATORIOS de review:**

- Apos escrever ou modificar codigo
- Antes de qualquer commit em branches compartilhadas
- Quando codigo sensivel a seguranca e alterado (auth, pagamentos, dados de usuario)
- Quando mudancas arquiteturais sao feitas
- Antes de fazer merge de pull requests

**Pre-requisitos do Review:**

Antes de solicitar review, garantir:
- Todos os checks automatizados (CI/CD) estao passando
- Conflitos de merge estao resolvidos
- Branch esta atualizada com a branch alvo

## Checklist de Review

Antes de marcar codigo como completo:

- [ ] Codigo legivel e bem nomeado
- [ ] Funcoes focadas (<50 linhas)
- [ ] Arquivos coesos (<800 linhas)
- [ ] Sem aninhamento profundo (>4 niveis)
- [ ] Erros tratados explicitamente
- [ ] Sem secrets ou credenciais hardcoded
- [ ] Sem console.log ou statements de debug
- [ ] Testes existem para nova funcionalidade
- [ ] Cobertura de testes atinge minimo de 80%

## Gatilhos de Security Review

**PARAR e usar agente security-reviewer quando:**

- Codigo de autenticacao ou autorizacao
- Tratamento de input do usuario
- Queries de banco de dados
- Operacoes de file system
- Chamadas a APIs externas
- Operacoes criptograficas
- Codigo de pagamento ou financeiro

## Niveis de Severidade

| Nivel | Significado | Acao |
|-------|-------------|------|
| CRITICAL | Vulnerabilidade de seguranca ou risco de perda de dados | **BLOQUEAR** - Corrigir antes do merge |
| HIGH | Bug ou issue significativo de qualidade | **ALERTAR** - Deveria corrigir antes do merge |
| MEDIUM | Preocupacao de manutenibilidade | **INFO** - Considerar corrigir |
| LOW | Estilo ou sugestao menor | **NOTA** - Opcional |

**Achado de seguranca**: a severidade ancora em impacto confirmado (CRITICAL = acesso sem autenticacao ou entre tenants, ou execucao de codigo;
HIGH = o mesmo com conta de baixo privilegio), nao no nome do padrao. Tres vereditos: **confirmado**, **refutado** (cite o controle que barra)
e `needs_validation` (plausivel, falta um fato; diga qual e nao atribua severidade). Suspeita sem principal, entrada, controle, fronteira,
recurso e resultado nomeados e candidato, nao vulnerabilidade. HIGH ou CRITICAL passa por verificador que tenta refutar antes do relatorio (`/security-audit`).

## Uso de Agentes

| Agente | Proposito |
|--------|-----------|
| **code-reviewer** | Qualidade geral, padroes, boas praticas |
| **security-reviewer** | Vulnerabilidades de seguranca, OWASP Top 10 |
| **typescript-reviewer** | Issues especificos de TypeScript/JavaScript |
| **python-reviewer** | Issues especificos de Python |

## Workflow de Review

```
1. Rodar git diff para entender mudancas
2. Checar checklist de seguranca primeiro
3. Revisar checklist de qualidade de codigo
4. Rodar testes relevantes
5. Verificar cobertura >= 80%
6. Usar agente apropriado para review detalhado
```

## Issues Comuns para Capturar

### Seguranca
- Credenciais hardcoded (API keys, senhas, tokens)
- SQL injection (concatenacao de strings em queries)
- Vulnerabilidades XSS (input do usuario sem escape)
- Path traversal (paths de arquivo nao sanitizados)
- Protecao CSRF ausente
- Bypasses de autenticacao

### Qualidade de Codigo
- Funcoes grandes (>50 linhas) - dividir em menores
- Arquivos grandes (>800 linhas) - extrair modulos
- Aninhamento profundo (>4 niveis) - usar early returns
- Tratamento de erro ausente - tratar explicitamente
- Padroes de mutacao - preferir operacoes imutaveis
- Testes faltando - adicionar cobertura

### Performance
- Queries N+1 - usar JOINs ou batching
- Paginacao ausente - adicionar LIMIT nas queries
- Queries sem limite - adicionar constraints
- Cache ausente - cachear operacoes caras

## Criterios de Aprovacao

- **Aprovar**: Sem issues CRITICAL ou HIGH
- **Alertar**: Apenas issues HIGH (merge com cautela)
- **Bloquear**: Issues CRITICAL encontrados
