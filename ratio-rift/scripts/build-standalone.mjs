import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const builtHtmlPath = resolve(projectRoot, 'dist/index.html')
const standalonePath = resolve(projectRoot, 'Ratio-Rift.html')

const html = await readFile(builtHtmlPath, 'utf8')
const scriptMatch = html.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
const styleMatch = html.match(/<link rel="stylesheet" crossorigin href="([^"]+)">/)

if (!scriptMatch || !styleMatch) {
  throw new Error('Could not locate the Vite JavaScript and CSS bundles.')
}

const assetPath = (reference) =>
  resolve(projectRoot, 'dist', reference.replace(/^\.\//, '').replace(/^\//, ''))

const [javascript, css] = await Promise.all([
  readFile(assetPath(scriptMatch[1]), 'utf8'),
  readFile(assetPath(styleMatch[1]), 'utf8'),
])

const standalone = html
  .replace(styleMatch[0], () => `<style>${css}</style>`)
  .replace(
    scriptMatch[0],
    () => `<script>${javascript.replaceAll('</script>', '<\\/script>')}</script>`,
  )

await mkdir(dirname(standalonePath), { recursive: true })
await writeFile(standalonePath, standalone)

console.log(`Created ${standalonePath}`)
