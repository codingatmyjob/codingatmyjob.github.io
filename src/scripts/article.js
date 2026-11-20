import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-powershell'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'

Prism.manual = true

const aliases = { html: 'markup', xml: 'markup', shell: 'bash', sh: 'bash', ps1: 'powershell', yml: 'yaml' }
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>'

const normalizeLanguage = (language) => {
  const key = String(language || '').toLowerCase()
  return aliases[key] || key
}

const inferLanguage = (code) => {
  const text = code.trim()
  if (/<([a-z][\w-]*)[\s>]/i.test(text)) return 'markup'
  if (/(^|\n)\s*\$env:/.test(text) || /\bGet-[A-Z]/.test(text)) return 'powershell'
  if (/(^|\n)\s*(npm|pnpm|yarn|git|cd|ls|cat)\b/.test(text)) return 'bash'
  if (/^\s*(?:\{|\[)[\s\S]*(?:\}|\])\s*$/.test(text) && /"\s*:/.test(text)) return 'json'
  return ''
}

const languageLabel = (language) => {
  const labels = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    ps1: 'PowerShell',
    powershell: 'PowerShell',
    markup: 'Markup'
  }
  const key = language.toLowerCase()
  if (labels[key]) return labels[key]
  if (['css', 'json', 'sql', 'jsx', 'tsx', 'yaml', 'yml'].includes(key)) return key.toUpperCase()
  return key ? `${key[0].toUpperCase()}${key.slice(1)}` : 'Text'
}

const copyText = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const field = document.createElement('textarea')
  field.value = value
  field.setAttribute('readonly', '')
  field.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
  document.body.appendChild(field)
  field.select()
  document.execCommand('copy')
  field.remove()
}

document.querySelectorAll('.article-container pre code').forEach((code) => {
  const pre = code.parentElement
  if (!pre || pre.parentElement?.classList.contains('code-block')) return
  const source = (code.textContent || '').replace(/(?:\r?\n[ \t]*)+$/g, '')
  code.textContent = source
  const classMatch = `${code.className} ${pre.className}`.match(/(?:lang|language)-([a-z0-9-]+)/i)
  const language = normalizeLanguage(classMatch?.[1] || inferLanguage(source))
  if (language) {
    code.classList.add(`language-${language}`)
    pre.classList.add(`language-${language}`)
    if (Prism.languages[language]) Prism.highlightElement(code)
  }
  const shell = document.createElement('div')
  shell.className = 'code-block'
  const toolbar = document.createElement('div')
  toolbar.className = 'code-block-toolbar'
  const label = document.createElement('span')
  label.className = 'code-language'
  label.textContent = languageLabel(language)
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'code-copy-trigger'
  button.setAttribute('aria-label', 'Copy code block')
  button.title = 'Copy code'
  button.innerHTML = copyIcon
  button.addEventListener('click', async () => {
    try {
      await copyText(source)
      button.classList.add('copied')
      button.setAttribute('aria-label', 'Copied')
      button.title = 'Copied'
      window.setTimeout(() => {
        button.classList.remove('copied')
        button.setAttribute('aria-label', 'Copy code block')
        button.title = 'Copy code'
      }, 1200)
    } catch (error) {
      console.warn('Copy failed:', error)
    }
  })
  toolbar.append(label, button)
  pre.before(shell)
  shell.append(toolbar, pre)
})

const articleContainer = document.querySelector('.article-container[data-collapsible="true"]')
articleContainer?.querySelectorAll('article h2').forEach((heading) => {
  const content = []
  let next = heading.nextElementSibling
  while (next && next.tagName !== 'H2') {
    content.push(next)
    next = next.nextElementSibling
  }
  if (!content.some((element) => element.textContent.trim())) return
  heading.style.cursor = 'pointer'
  heading.classList.add('collapsible', 'collapsed')
  content.forEach((element) => { element.style.display = 'none' })
  heading.addEventListener('click', () => {
    const collapsed = heading.classList.toggle('collapsed')
    content.forEach((element) => { element.style.display = collapsed ? 'none' : '' })
  })
})
