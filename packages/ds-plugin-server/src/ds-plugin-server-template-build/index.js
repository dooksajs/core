import { definePlugin } from '@dooksa/ds-app'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { extname, join } from 'path'
import { JSDOM } from 'jsdom'
import { parseAction } from '@dooksa/parse'
import checksum from '@dooksa/crypto-hash'
import uuid from '@dooksa/crypto-uuid'

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
    if (!buildDir) {
      return
    }

    if (!existsSync(buildDir)) {
      console.warn('warning', 'Widget directory could not be found:', buildDir)
      return
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
      const template = this.$getDataValue('dsTemplate/items', { id })

      if (template.isEmpty) {
        // check if any new template files were added
        this._getFiles()
        const template = this.$getDataValue('dsTemplate/items', { id })

        if (template.isEmpty) {
          return response.sendStatus(404)
        }
      }

      this.$setDataValue('dsPage/items', id, {
        id: request.path
      })

      request.dsPageData = this.$method('dsPage/getById', request.path)

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
          const fileChecksum = checksum(file)

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
        const fileChecksum = checksum(file)

        // rebuild template
        if (!watchFile || watchFile !== fileChecksum) {
          this._parseTemplate(file)
        }

        this.watchFiles[path] = fileChecksum
      }
    },
    _parseAction (items) {
      for (let i = 0; i < items.length; i++) {
        const action = items[i]
        const sequenceId = uuid()

        this.actions[action.id] = {
          items: {},
          sequences: {},
          blocks: {}
        }

        const actions = this.actions[action.id]

        this.actionSequences[action.id] = sequenceId
        actions.items[sequenceId] = []

        for (let i = 0; i < action.sequence.length; i++) {
          const result = parseAction(action.sequence[i])

          actions.items[sequenceId].push(result.sequenceId)
          actions.sequences[result.sequenceId] = result.sequences
          actions.blocks = Object.assign(actions.blocks, result.blocks)
        }
      }
    },
    _parseTemplate (file) {
      const fragment = JSDOM.fragment(file)
      const templates = fragment.querySelectorAll('template[ds-template-id]')

      for (let i = 0; i < templates.length; i++) {
        const template = templates[i]

        const result = this.$method('dsTemplate/parseHTML', {
          html: template,
          actions: this.actionSequences
        })

        // template actions are uses to send specific template actions on request
        const templateActions = []
        this.templateActions[result.id] = templateActions

        for (let i = 0; i < result.templateActions.length; i++) {
          const actions = this.actions[result.templateActions[i]]

          templateActions.push(['dsTemplate/actionItems', Object.keys(actions.items)])
          templateActions.push(['dsTemplate/actionSequences', Object.keys(actions.sequences)])
          templateActions.push(['dsTemplate/actionBlocks', Object.keys(actions.blocks)])

          this.$setDataValue('dsTemplate/actionItems', actions.items, { merge: true })
          this.$setDataValue('dsTemplate/actionSequences', actions.sequences, { merge: true })
          this.$setDataValue('dsTemplate/actionBlocks', actions.blocks, { merge: true })
        }
      }
    }
  }
})
