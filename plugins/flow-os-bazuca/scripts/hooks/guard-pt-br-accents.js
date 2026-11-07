#!/usr/bin/env node
/**
 * PostToolUse hook: Write|Edit
 * Sinaliza (WARNING, não bloqueia) palavras portuguesas escritas sem acento.
 *
 * Escopo:
 *   - .md / .txt / .mdx : escaneia TODO o conteúdo (prosa — zero falso-positivo).
 *   - .html/.tsx/.jsx/.vue/.svelte/.astro : escaneia apenas TEXTO VISÍVEL
 *     (texto entre tags JSX >…< e literais de string), pois identificadores de
 *     código em pt-BR são ASCII por regra (funcao, gestao) e não devem ser
 *     flagados. Isso mantém o ruído baixo.
 *
 * Ref: rules/common/portuguese.md (fundida em 2026-09-03; a lista BARE_WORDS abaixo e a fonte unica)
 * Exit 0 sempre (warning). Passa o stdin adiante intacto.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
const PROSE_EXT = /\.(md|mdx|txt)$/i;
const CODE_EXT = /\.(html?|tsx|jsx|vue|svelte|astro)$/i;

// Formas sem acento que quase nunca são legítimas em prosa pt-BR.
// (lista curta e de alta frequência — ver rules para a lista completa)
const BARE_WORDS = [
  'nao', 'sao', 'entao', 'gestao', 'ingestao', 'versao', 'sessao', 'decisao',
  'conexao', 'excecao', 'exceçao', 'padrao', 'orgao', 'razao',
  'acao', 'acoes', 'funcao', 'funcoes', 'opcao', 'opcoes', 'secao', 'secoes',
  'operacao', 'operacoes', 'configuracao', 'configuracoes', 'execucao',
  'informacao', 'informacoes', 'notificacao', 'notificacoes', 'documentacao',
  'implementacao', 'integracao', 'autenticacao', 'autorizacao', 'validacao',
  'aplicacao', 'aplicacoes', 'comunicacao', 'aprovacao', 'atualizacao',
  'criacao', 'descricao', 'restricao', 'posicao', 'situacao', 'requisicao',
  'producao', 'publicacao', 'permissao', 'revisao', 'migracao', 'paginacao',
  'instalacao', 'definicao', 'avaliacao', 'importacao', 'exportacao',
  'solucao', 'conclusao', 'alocacao', 'visualizacao', 'sincronizacao',
  'tambem', 'voce', 'alem', 'porem', 'ninguem', 'ate', 'apos',
  'servico', 'servicos', 'preco', 'precos', 'licenca', 'comeco',
  'valido', 'invalido', 'rapido', 'unico', 'publico', 'numero', 'proximo',
  'ultimo', 'minimo', 'maximo', 'automatico', 'especifico', 'logico',
  'basico', 'tecnico', 'critico', 'historico', 'dinamico', 'estatico',
  'usuario', 'usuarios', 'relatorio', 'relatorios', 'diretorio', 'repositorio',
  'necessario', 'obrigatorio', 'area', 'areas', 'saude', 'pagina', 'paginas',
];

// Palavras ASCII legítimas que colidem com a lista — nunca flagar.
const WHITELIST = new Set([
  'sao', // "São Paulo" costuma vir com acento, mas "sao" isolado em código/URL é comum
]);

function getFilePath(input) {
  const t = input?.tool_input || {};
  if (t.file_path) return String(t.file_path);
  if (Array.isArray(t.edits) && t.edits[0]?.file_path) return String(t.edits[0].file_path);
  return '';
}

function getWrittenContent(input) {
  const t = input?.tool_input || {};
  // Write → content ; Edit → new_string ; MultiEdit → edits[].new_string
  if (typeof t.content === 'string') return t.content;
  if (typeof t.new_string === 'string') return t.new_string;
  if (Array.isArray(t.edits)) return t.edits.map(e => e?.new_string || '').join('\n');
  return '';
}

/** Extrai só o texto visível de arquivos de código (texto JSX + literais). */
function extractVisibleText(content) {
  const chunks = [];
  // Texto entre > e < que contenha letras (texto JSX/HTML)
  const jsxText = content.match(/>([^<>{}]*[a-zA-ZÀ-ÿ][^<>{}]*)</g) || [];
  chunks.push(...jsxText);
  // Literais de string ('...', "...", `...`)
  const strings = content.match(/(['"`])(?:\\.|(?!\1)[^\\])*\1/g) || [];
  chunks.push(...strings);
  return chunks.join('\n');
}

function findBareWords(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const word of BARE_WORDS) {
    if (WHITELIST.has(word)) continue;
    // \b não funciona bem com acentos vizinhos; usa lookaround por não-letra
    const re = new RegExp(`(?<![a-zà-ÿ])${word}(?![a-zà-ÿ])`, 'i');
    if (re.test(lower)) found.add(word);
  }
  return [...found];
}

function run(raw) {
  let input;
  try {
    input = raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return { exitCode: 0, stdout: raw };
  }

  const filePath = getFilePath(input);
  const base = path.basename(filePath);
  const isProse = PROSE_EXT.test(filePath);
  const isCode = CODE_EXT.test(filePath);

  if (!isProse && !isCode) return { exitCode: 0, stdout: raw };

  const content = getWrittenContent(input);
  if (!content || content.length < 8) return { exitCode: 0, stdout: raw };

  const scanTarget = isProse ? content : extractVisibleText(content);
  const found = findBareWords(scanTarget);

  if (found.length === 0) return { exitCode: 0, stdout: raw };

  const sample = found.slice(0, 12).join(', ');
  const stderr = [
    `[pt-BR] Possíveis palavras SEM acento em ${base}:`,
    `  ${sample}${found.length > 12 ? ` (+${found.length - 12})` : ''}`,
    `  Corrija a acentuação (ex.: nao→não, gestao→gestão, servico→serviço).`,
    `  Prosa em pt-BR sempre com acento; identificadores de código permanecem ASCII.`,
  ].join('\n');

  return { exitCode: 0, stdout: raw, stderr };
}

module.exports = { run, findBareWords, extractVisibleText };

if (require.main === module) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', c => {
    if (raw.length < MAX_STDIN) raw += c.substring(0, MAX_STDIN - raw.length);
  });
  process.stdin.on('end', () => {
    const r = run(raw);
    if (r.stderr) process.stderr.write(r.stderr + '\n');
    process.stdout.write(typeof r.stdout === 'string' ? r.stdout : raw);
    process.exit(r.exitCode || 0);
  });
}
