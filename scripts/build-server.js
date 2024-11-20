import path from 'path'
import * as esbuild from 'esbuild'
import { readdir, unlink } from 'fs'
import { realpathSync } from 'node:fs'

const rootDir = realpathSync(process.cwd())
const outdir = path.resolve(rootDir, 'dist')

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
  entryPoints: [path.resolve(rootDir, 'packages', 'app', 'src', 'server.js')],
  bundle: true,
  treeShaking: true,
  splitting: true,
  outdir,
  format: 'esm',
  platform: 'node',
  loader: {
    '.node': 'file'
  },
  metafile: true,
  minify: true,
  dropLabels: ['DEV'],
  reserveProps: /__d/
})

console.log(await esbuild.analyzeMetafile(result.metafile))
