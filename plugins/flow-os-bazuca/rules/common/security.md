# Diretrizes de Seguranca

## Checagens Obrigatorias de Seguranca

Antes de QUALQUER commit:
- [ ] Sem secrets hardcoded (API keys, senhas, tokens)
- [ ] Todas as entradas do usuario validadas
- [ ] Prevencao de SQL injection (queries parametrizadas)
- [ ] Prevencao de XSS (HTML sanitizado)
- [ ] Protecao CSRF habilitada
- [ ] Autenticacao/autorizacao verificada
- [ ] Rate limiting em todos os endpoints
- [ ] Mensagens de erro nao vazam dados sensiveis

## Gestao de Secrets

- NUNCA fazer hardcode de secrets no codigo fonte
- SEMPRE usar variaveis de ambiente ou gerenciador de secrets
- Validar que secrets obrigatorios estao presentes na inicializacao
- Rotacionar qualquer secret que possa ter sido exposto

## Protocolo de Resposta a Incidentes de Seguranca

Se encontrar problema de seguranca:
1. PARAR imediatamente
2. Usar agente **security-reviewer**
3. Corrigir issues CRITICOS antes de continuar
4. Rotacionar qualquer secret exposto
5. Revisar todo o codebase em busca de issues similares
