import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const appDirectory = fs.realpathSync(process.cwd())
export const scriptDirectory = fileURLToPath(new URL('..', import.meta.url))
