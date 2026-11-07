#!/usr/bin/env node
/**
 * Hook PreToolUse → Write|Edit
 * Bloqueia writes que contenham secrets (API keys, tokens, passwords).
 * Exit 2 = BLOCK, Exit 0 = ALLOW
 */

const SECRET_PATTERNS = [
  { name: 'Supabase Service Key', pattern: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]{50,}/i },
  { name: 'Supabase Access Token', pattern: /sbp_[a-f0-9]{40,}/i },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/i },
  // Chaves de LLM: eram o buraco mais obvio da lista — o harness inteiro gira
  // em torno delas e nenhum pattern as pegava.
  { name: 'Anthropic API Key', pattern: /sk-ant-(?:api|admin)[0-9]{2}-[A-Za-z0-9_-]{20,}/i },
  { name: 'OpenAI API Key', pattern: /sk-(?:proj-)?[A-Za-z0-9_-]{32,}/ },
  { name: 'OpenRouter API Key', pattern: /sk-or-v1-[a-f0-9]{40,}/i },
  { name: 'Google AI API Key', pattern: /AIza[A-Za-z0-9_-]{35}/ },
  { name: 'GitHub PAT', pattern: /gh[ps]_[A-Za-z0-9_]{36,}/i },
  { name: 'GitHub PAT fine-grained', pattern: /github_pat_[A-Za-z0-9_]{22,}/i },
  { name: 'Generic API Key assignment', pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/i },
  { name: 'Generic Secret assignment', pattern: /(?:secret|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9_\-\.]{40,}/i },
  { name: 'Telegram Bot Token', pattern: /\d{8,10}:[A-Za-z0-9_-]{35}/i },
  { name: 'Portainer Token', pattern: /ptr_[A-Za-z0-9+/=]{30,}/i },
  { name: 'Private Key', pattern: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH)?\s*PRIVATE KEY-----/i },
  { name: 'Database URL with password', pattern: /(?:postgres|mysql|mongodb):\/\/[^:]+:[^@]+@[^/]+/i },
]

// Arquivos onde patterns de secret são esperados (docs, exemplos, o próprio hook)
const SKIP_PATTERNS = [
  '.env.example',
  'SKILL.md',
  'guard-secrets',
  'scan-output',
  'pesquisa-seguranca',
  'diagnostico-seguranca',
  'gap-analysis-seguranca',
  'node_modules',
]

function main() {
  let input = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => { input += chunk })
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input)
      const content = data.tool_input?.content || data.tool_input?.new_string || ''
      const filePath = data.tool_input?.file_path || ''

      if (SKIP_PATTERNS.some(f => filePath.includes(f))) {
        process.stdout.write(input)
        return process.exit(0)
      }

      if (content.length < 20) {
        process.stdout.write(input)
        return process.exit(0)
      }

      const found = []
      for (const { name, pattern } of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          found.push(name)
        }
      }

      if (found.length > 0) {
        process.stderr.write(`[guard-secrets] BLOCKED: Possivel secret detectado no write:\n`)
        process.stderr.write(`  Tipos: ${found.join(', ')}\n`)
        process.stderr.write(`  Arquivo: ${filePath}\n`)
        process.stderr.write(`  Use variaveis de ambiente ao inves de hardcoding.\n`)
        return process.exit(2)
      }

      process.stdout.write(input)
      process.exit(0)
    } catch {
      process.stdout.write(input || '')
      process.exit(0)
    }
  })
}

main()
