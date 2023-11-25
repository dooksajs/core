import fs from 'fs'
import { fileURLToPath } from 'url'

export const appDirectory = fs.realpathSync(process.cwd())
export const scriptDirectory = fileURLToPath(new URL('..', import.meta.url))
