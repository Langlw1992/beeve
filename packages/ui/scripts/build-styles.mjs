import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const packageDir = resolve(scriptDir, '..')
const sourcePath = resolve(packageDir, 'src/styles/index.css')
const outputPath = resolve(packageDir, 'dist/styles.css')

const source = await readFile(sourcePath, 'utf8')
const output = source.replace('@source "..";', '@source "./source";')

await mkdir(dirname(outputPath), {recursive: true})
await writeFile(outputPath, output)
