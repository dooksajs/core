import path from 'path'
import * as esbuild from 'esbuild'
import { appDirectory, scriptDirectory } from '../utils/paths.js'
import { readdir, unlink } from 'fs'

const outdir = path.resolve(appDirectory, 'app', 'production', 'dist')

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
  entryPoints: [path.resolve(scriptDirectory, 'entry', 'build', 'index.js')],
  bundle: true,
  treeShaking: true,
  splitting: true,
  outdir,
  format: 'esm',
  minify: true,
  platform: 'browser',
  metafile: true,
  reserveProps: /__d__/
})

console.log(await esbuild.analyzeMetafile(result.metafile))
