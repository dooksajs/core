import { definePlugin } from '@dooksa/ds-scripts'
import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { tmpdir } from 'node:os'
import sass from 'sass-embedded'

export default definePlugin({
  name: 'dsTheme',
  version: 1,
  dependencies: [
    {
      name: 'dsPage',
      version: 1
    }
  ],
  data: {
    sassPath: {
      schema: {
        type: 'string'
      }
    },
    customSassPath: {
      private: true,
      schema: {
        type: 'string'
      }
    }
  },
  setup ({ customSassPath }) {
    if (customSassPath) {
      if (existsSync(customSassPath)) {
        this.customSassPath = customSassPath
      } else {
        this.$log('warn', { message: 'Custom sass directory does not exist: ' + customSassPath })
      }
    }

    this.$setDataValue('dsTheme/sassPath', resolve(import.meta.dirname, 'theme', 'scss'))
    this.compile()
  },
  methods: {
    compile () {
      return new Promise((pResolve, pReject) => {
        const tempDir = tmpdir()
        const sassString = this._getSass()
        const sassTempPath = resolve(tempDir, 'ds-sass.scss')

        writeFileSync(sassTempPath, sassString)

        const options = {
          style: 'compressed'
        }

        if (this.isDev) {
          options.logger = {
            warn: (message, options) => {
              let log = ''

              if (options.span) {
                const span = options.span

                log += `${span.url}:${span.start.line}:${span.start.column}: ${message}\n`
              } else {
                log += `::: ${message}\n`
              }

              this.$log('warn', { message: log })
            }
          }
        }

        sass.compileAsync(sassTempPath, options)
          .then(result => {
            this.$setDataValue('dsPage/css', result.css)
            pResolve()
          })
          .catch(error => {
            this.$log('error', { message: 'Sass failed to compile', cause: error })
            pReject(error)
          })
      })
    },
    _getSass () {
      const sassPath = this.$getDataValue('dsTheme/sassPath')
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

      if (this.customSassPath && existsSync(this.customSassPath)) {
        const files = readdirSync(this.customSassPath, {
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
  }
})
