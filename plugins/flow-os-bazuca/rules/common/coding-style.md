# Estilo de Codigo

## Imutabilidade (CRITICO)

SEMPRE criar novos objetos, NUNCA mutar os existentes:

```
// Pseudocodigo
ERRADO:  modify(original, field, value) -> altera original in-place
CORRETO: update(original, field, value) -> retorna nova copia com alteracao
```

Motivo: Dados imutaveis previnem efeitos colaterais ocultos, facilitam debug e permitem concorrencia segura.

## Principios Centrais

### KISS (Keep It Simple)

- Preferir a solucao mais simples que funcione
- Evitar otimizacao prematura
- Otimizar para clareza, nao para esperteza

### DRY (Don't Repeat Yourself)

- Extrair logica repetida em funcoes ou utilitarios compartilhados
- Evitar drift de implementacao por copy-paste
- Introduzir abstracoes quando a repeticao e real, nao especulativa

### YAGNI (You Aren't Gonna Need It)

- Nao construir features ou abstracoes antes de serem necessarias
- Evitar generalidade especulativa
- Comecar simples, refatorar quando a pressao for real

## Organizacao de Arquivos

MUITOS ARQUIVOS PEQUENOS > POUCOS ARQUIVOS GRANDES:
- Alta coesao, baixo acoplamento
- 200-400 linhas tipico, 800 maximo
- Extrair utilitarios de modulos grandes
- Organizar por feature/dominio, nao por tipo

## Tratamento de Erros

SEMPRE tratar erros de forma abrangente:
- Tratar erros explicitamente em cada nivel
- Fornecer mensagens amigaveis em codigo voltado ao usuario
- Logar contexto detalhado do erro no lado servidor
- Nunca engolir erros silenciosamente

## Validacao de Entrada

SEMPRE validar nas fronteiras do sistema:
- Validar toda entrada do usuario antes de processar
- Usar validacao baseada em schema quando disponivel
- Falhar rapido com mensagens de erro claras
- Nunca confiar em dados externos (respostas de API, input do usuario, conteudo de arquivo)

## Convencoes de Nomenclatura

- Variaveis e funcoes: `camelCase` com nomes descritivos
- Booleanos: preferir prefixos `is`, `has`, `should`, ou `can`
- Interfaces, types e componentes: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`
- Custom hooks: `camelCase` com prefixo `use`

## Code Smells para Evitar

### Aninhamento Profundo
Preferir early returns ao inves de condicionais aninhados.

### Numeros Magicos
Usar constantes nomeadas para thresholds, delays e limites.

### Funcoes Longas
Dividir funcoes grandes em pecas focadas com responsabilidades claras.

## Checklist de Qualidade de Codigo

Antes de marcar trabalho como completo:
- [ ] Codigo legivel e bem nomeado
- [ ] Funcoes pequenas (<50 linhas)
- [ ] Arquivos focados (<800 linhas)
- [ ] Sem aninhamento profundo (>4 niveis)
- [ ] Tratamento adequado de erros
- [ ] Sem valores hardcoded (usar constantes ou config)
- [ ] Sem mutacao (padroes imutaveis usados)
