import { createPlugin } from '@dooksa/create'
import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { tmpdir } from 'node:os'
import sass from 'sass-embedded'
import { $getDataValue, $setDataValue } from '@dooksa/plugins'

let customStylesPath = ''

function getStyles () {
  const sassPath = $getDataValue('theme/styles')
  const sass = {
    variables: '',
    maps: '',
    custom: ''
  }

  const customFiles = readdirSync(resolve(sassPath.item, 'custom'), {
    withFileTypes: true
  })

  // sort sass files
  for (let i = 0; i < customFiles.length; i++) {
    const file = customFiles[i]

    if (file.isFile()) {
      if (file.name === '_variables.scss') {
        sass.variables += `@import "${file.path}/${file.name}";\n`
      } else if (file.name === '_maps.scss') {
        sass.maps += `@import "${file.path}/${file.name}";\n`
      } else if (extname(file.name) === '.scss') {
        sass.custom += `@import "${file.path}/${file.name}";\n`
      }
    }
  }

  if (customStylesPath && existsSync(customStylesPath)) {
    const files = readdirSync(customStylesPath, {
      recursive: true,
      withFileTypes: true
    })

    // sort sass files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.isFile()) {
        if (file.name === '_variables.scss') {
          sass.variables += `@import "${file.path}/${file.name}";`
        } else if (file.name === '_maps.scss') {
          sass.maps += `@import "${file.path}/${file.name}";`
        } else if (extname(file.name) === '.scss') {
          sass.custom += `@import "${file.path}/${file.name}";`
        }
      }
    }
  }

  const bootstrapPath = resolve(sassPath.item, 'bootstrap')
  let result = `@import "${bootstrapPath}/_bootstrap-functions.scss";`

  // create sass import order
  result += sass.variables
  result += `@import "${bootstrapPath}/_bootstrap-variables";`
  result += sass.maps
  result += `@import "${bootstrapPath}/_bootstrap";`
  result += sass.custom

  return result
}

function compile () {
  return new Promise((pResolve, pReject) => {
    const tempDir = tmpdir()
    const sassString = getStyles()
    const sassTempPath = resolve(tempDir, 'ds-sass.scss')

    writeFileSync(sassTempPath, sassString)

    const options = {
      style: 'compressed'
    }

    DEV: {
      options.logger = {
        warn: (message, options) => {
          let log = ''

          if (options.span) {
            const span = options.span

            log += `${span.url}:${span.start.line}:${span.start.column}: ${message}\n`
          } else {
            log += `::: ${message}\n`
          }

          pReject(log)
        }
      }
    }

    sass.compileAsync(sassTempPath, options)
      .then(result => {
        $setDataValue('page/css', result.css)
        pResolve()
      })
      .catch(error => {
        pReject(error)
      })
  })
}

const theme = createPlugin({
  name: 'theme',
  data: {
    styles: {
      type: 'string'
    }
  },
  actions: {
    compile
  },
  setup ({ stylesPath = '' } = {}) {
    if (stylesPath) {
      if (!existsSync(stylesPath)) {
        throw new Error('Custom sass directory does not exist: ' + stylesPath)
      }

      customStylesPath = stylesPath
    }

    $setDataValue('theme/styles', resolve(import.meta.dirname, 'theme', 'scss'))

    compile()
  }
})

const themeCompile = compile

export {
  themeCompile
}

export default theme
