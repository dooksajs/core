import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const appDirectory = fs.realpathSync(process.cwd())
export const scriptDirectory = path.resolve(__dirname, '..')
