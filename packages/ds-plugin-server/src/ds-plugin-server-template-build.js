import { definePlugin } from '@dooksa/ds-scripts'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { parseAction } from '@dooksa/parse'

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
    buildPaths: {
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
  /**
   * @param {Object} param 
   * @param {string[]} param.buildPaths - Location of template files 
   */
  setup ({ buildPaths = [] }) {
    buildPaths.unshift(resolve(import.meta.dirname, 'theme', 'templates'))
    
    for (let i = 0; i < buildPaths.length; i++) {
      const buildPath = buildPaths[i]
      
      if (!existsSync(buildPath)) {
        this.$log('error', { message: 'Template directory could not be found: ' + buildPath })
      }
    }

    this.buildPaths = buildPaths
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
    /**
     * Build Dooksa template files
     * @param {Object} param 
     * @param {string} param.path - Template file path  
     */
    create ({ path }) {
      const fileExtension = extname(path)

      if (fileExtension === '.json') {
        const file = readFileSync(path, { encoding: 'utf-8' })
        const item = JSON.parse(file)

        // build actions
        if (item.actions) {
          this._parseAction(item.actions)
        }

        if (item.templates) {
          for (let i = 0; i < item.templates.length; i++) {
            const template = item.templates[i]
            const options = { id: template.id }

            delete template.id

            this.$setDataValue('dsTemplate/metadata', template, options)
          }
        }
      }

      // process html files
      if (fileExtension === '.html') {
        const file = readFileSync(path, { encoding: 'utf-8' })

        // rebuild template
        this._parseTemplate(file)
      }
    },
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
      for (let i = 0; i < this.buildPaths.length; i++) {
        const buildPath = this.buildPaths[i]
        const files = readdirSync(buildPath, {
          recursive: true,
          withFileTypes: true
        })
  
        // process all the action files
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          if (file.isFile()) {
            this.create({
              path: resolve(file.path, file.name) 
            })
          }
        }
      }
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

          if (action.dependencies) {
            actions.dependencies = action.dependencies
          }

          actions.items[action.id].push(result.sequenceId)
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
