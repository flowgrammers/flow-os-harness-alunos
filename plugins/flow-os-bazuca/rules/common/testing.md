# Requisitos de Testes

## Cobertura Minima: 80%

Tipos de Teste (TODOS obrigatorios):
1. **Testes Unitarios** - Funcoes individuais, utilitarios, componentes
2. **Testes de Integracao** - Endpoints de API, operacoes de banco
3. **Testes E2E** - Fluxos criticos do usuario (framework escolhido por linguagem)

## Desenvolvimento Orientado a Testes (TDD)

Workflow OBRIGATORIO:
1. Escrever teste primeiro (VERMELHO)
2. Rodar teste - deve FALHAR
3. Escrever implementacao minima (VERDE)
4. Rodar teste - deve PASSAR
5. Refatorar (MELHORAR)
6. Verificar cobertura (80%+)

## Troubleshooting de Falhas em Testes

1. Usar agente **tdd-guide**
2. Checar isolamento dos testes
3. Verificar se mocks estao corretos
4. Corrigir implementacao, nao testes (a menos que os testes estejam errados)

## Suporte de Agentes

- **tdd-guide** - Usar PROATIVAMENTE para novas features, forca escrever testes primeiro

## Estrutura de Teste (Padrao AAA)

Preferir estrutura Arrange-Act-Assert para testes:

```typescript
test('calcula similaridade corretamente', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### Nomenclatura de Testes

Usar nomes descritivos que expliquem o comportamento sendo testado:

```typescript
test('retorna array vazio quando nenhum mercado corresponde a query', () => {})
test('lanca erro quando API key esta ausente', () => {})
test('faz fallback para busca por substring quando Redis esta indisponivel', () => {})
```
