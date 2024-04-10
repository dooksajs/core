import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const appDirectory = realpathSync(process.cwd())
export const scriptDirectory = fileURLToPath(new URL('..', import.meta.url))

