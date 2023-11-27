import { definePlugin } from '@dooksa/utils'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { extname, join } from 'path'
import { JSDOM } from 'jsdom'
import { parseAction } from '@dooksa/parse'
import { createHash } from 'node:crypto'

/**
 * @namespace dsTemplateBuild
 */
export default definePlugin({
  name: 'dsTemplateBuild',
  version: 1,
  dependencies: [
    {
      name: 'dsWidget',
      version: 1
    }
  ],
  data: {
    watchFiles: {
      private: true,
      schema: {
        type: 'array',
        items: {
          type: 'string'
        }
      }
    },
    buildDir: {
      private: true,
      schema: {
        type: 'string'
      }
    },
    actionSequences: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    actions: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    templateActions: {
      private: true,
      schema: {
        type: 'object'
      }
    }
  },
  setup ({ buildDir }) {
    if (!buildDir || !existsSync(buildDir)) {
      this.$log('error', { message: 'Widget directory could not be found: ' + buildDir })
    }

    this.buildDir = buildDir
    this._getFiles()

    this.$setWebServerRoute('/build/template/:id', {
      method: 'get',
      handlers: [
        this._build.bind(this),
        (request, response) => {
          this.$method('dsPage/create', { request, response })
        }
      ]
    })
  },
  methods: {
    _build (request, response, next) {
      const id = request.params.id
      const template = this.$getDataValue('dsTemplate/items', {
        id,
        options: {
          expand: true
        }
      })

      if (template.isEmpty) {
        // check if any new template files were added
        this._getFiles()
        const template = this.$getDataValue('dsTemplate/items', { id })

        if (template.isEmpty) {
          return response.sendStatus(404)
        }
      }

      const data = template.expand

      data.push({
        collection: 'dsTemplate/items',
        id,
        item: template.item,
        metadata: template.metadata
      })

      request.dsPageData = {
        isEmpty: false,
        item: data,
        templates: [id]
      }

      next()
    },
    _getFiles () {
      const fileNames = readdirSync(this.buildDir)
      const templatePaths = []

      // process all the action files
      for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i]
        const fileExtension = extname(fileName)

        if (fileExtension === '.json') {
          const path = join(this.buildDir, fileName)
          const file = readFileSync(path, { encoding: 'utf-8' })
          const watchFile = this.watchFiles[path]
          const fileChecksum = this._hash(file)

          // build actions
          if (!watchFile || watchFile !== fileChecksum) {
            const json = JSON.parse(file)

            if (json.actions) {
              this._parseAction(json.actions)
            }
          }

          this.watchFiles[path] = fileChecksum
        }

        if (fileExtension === '.html') {
          const path = join(this.buildDir, fileName)

          templatePaths.push(path)
        }
      }

      // process html files
      for (let i = 0; i < templatePaths.length; i++) {
        const path = templatePaths[i]
        const file = readFileSync(path, { encoding: 'utf-8' })
        const watchFile = this.watchFiles[path]
        const fileChecksum = this._hash(file)

        // rebuild template
        if (!watchFile || watchFile !== fileChecksum) {
          this._parseTemplate(file)
        }

        this.watchFiles[path] = fileChecksum
      }
    },
    _hash (item) {
      const hash = createHash('sha256')

      return hash.update(item, 'utf-8').digest('base64')
    },
    _parseAction (items) {
      for (let i = 0; i < items.length; i++) {
        const action = items[i]

        this.actions[action.id] = {
          items: {},
          sequences: {},
          blocks: {}
        }

        const actions = this.actions[action.id]

        actions.items[action.id] = []

        for (let i = 0; i < action.sequence.length; i++) {
          const result = parseAction(action.sequence[i])

          actions.items[action.id].push({ id: result.sequenceId })
          actions.sequences[result.sequenceId] = result.sequences
          actions.blocks = Object.assign(actions.blocks, result.blocks)
        }
      }
    },
    _parseTemplate (file) {
      const fragment = JSDOM.fragment(file)
      const templates = fragment.querySelectorAll('template[ds-template-id]')

      if (!templates) {
        const templates = fragment.querySelectorAll('template')

        if (templates) {
          this.$log('error', { message: 'Templates missing the "ds-template-id" attribute', code: 55 })
        }

        this.$log('error', { message: 'No templates found', code: 54 })
      }

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i]

        this.$method('dsTemplate/parseHTML', {
          html: template,
          actions: this.actions
        })
      }
    }
  }
})
