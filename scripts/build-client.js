import path from 'path'
import * as esbuild from 'esbuild'
import { existsSync, mkdirSync, readdir, unlink } from 'fs'
import { realpathSync } from 'node:fs'

const rootDir = realpathSync(process.cwd())
const outdir = path.resolve(rootDir, 'dist', 'client')

// create dist directory if doesn't exist
if (!existsSync(outdir)) {
  mkdirSync(outdir, { recursive: true })
}

// delete previous build
readdir(outdir, (err, files) => {
  if (err) throw err

  for (const file of files) {
    unlink(path.join(outdir, file), (err) => {
      if (err) throw err
    })
  }
})

const result = await esbuild.build({
  entryPoints: [path.resolve(rootDir, 'packages', 'create-app', 'src', 'build', 'client.js')],
  bundle: true,
  treeShaking: true,
  splitting: true,
  outdir,
  format: 'esm',
  platform: 'browser',
  metafile: true,
  minify: true,
  target: ['es2020'],
  dropLabels: ['DEV'],
  reserveProps: /__ds/
})

console.log(await esbuild.analyzeMetafile(result.metafile))
