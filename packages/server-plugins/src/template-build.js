import { createPlugin } from '@dooksa/create'
import { $getDataValue, $setDataValue } from '@dooksa/plugins'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { JSDOM } from 'jsdom'
import parseAction from './utils/parse-action.js'
import { pageCreate } from './page.js'
import { $setRoute } from './http.js'
import { $component, $componentGetter } from './component.js'
import { getNodeValue } from '@dooksa/utils'
import parseHTML from './utils/parse-html.js'
import { templatePath } from '@dooksa/templates'

const actions = {}
const availableMethods = {
  action_dispatch: true,
  delete_dataValue: true,
  eval_condition: true,
  get_actionValue: true,
  get_blockValue: true,
  get_dataValue: true,
  get_contextValue: true,
  get_payloadValue: true,
  get_sequenceValue: true,
  set_actionValue: true,
  set_dataValue: true,
  data_generateId: true,
  data_find: true,
  fetch_getAll: true,
  fetch_getById: true,
  layout_create: true,
  list_filter: true,
  list_forEach: true,
  list_push: true,
  list_sort: true,
  list_splice: true,
  operator_compare: true,
  operator_eval: true,
  query_filter: true,
  query_fetch: true,
  router_currentId: true,
  router_currentPath: true,
  router_navigate: true,
  section_append: true,
  section_render: true,
  section_set: true,
  section_update: true,
  template_create: true,
  token_textContent: true,
  view_insert: true,
  view_remove: true,
  view_replace: true,
  view_updateValue: true,
  view_removeAttribute: true,
  view_setAttribute: true,
  viewModal_create: true,
  viewModal_show: true,
  widget_attachedToIndex: true,
  widget_remove: true
}

const templateBuild = createPlugin({
  name: 'templateBuild',
  models: {
    path: {
      type: 'string'
    }
  },
  actions: {
    /**
     * Build Dooksa template files
     * @param {Object} param
     * @param {string} param.path - Template file path
     */
    create (path) {
      const fileExtension = extname(path)

      if (fileExtension === '.json') {
        const file = readFileSync(path, { encoding: 'utf-8' })
        const item = JSON.parse(file)

        // build actions
        if (item.actions) {
          parseActionItem(item.actions, actions, availableMethods)
        }

        if (item.templates) {
          for (let i = 0; i < item.templates.length; i++) {
            const template = item.templates[i]
            const options = { id: template.id }

            delete template.id

            $setDataValue('template/metadata', template, options)
          }
        }
      }

      // process html files
      if (fileExtension === '.html') {
        const file = readFileSync(path, { encoding: 'utf-8' })

        // rebuild template
        processTemplates(file, actions)
      }
    }
  },
  /**
   * @param {Object} param
   * @param {string[]} [param.buildPaths] - Location of template files
   * @param {string} [param.themePath] - Location of template files
   */
  setup ({ buildPaths = [] } = {}) {
    buildPaths.unshift(templatePath)

    for (let i = 0; i < buildPaths.length; i++) {
      const buildPath = buildPaths[i]

      if (!existsSync(buildPath)) {
        throw new Error('Template directory could not be found: ' + buildPath)
      }
    }

    getFiles(buildPaths)

    $setRoute('/build/template/:id', {
      method: 'get',
      handlers: [
        (request, response, next) => {
          const id = request.params.id
          const template = $getDataValue('template/items', {
            id,
            options: {
              expand: true
            }
          })

          if (template.isEmpty) {
            // check if any new template files were added
            getFiles(buildPaths)
            const template = $getDataValue('template/items', { id })

            if (template.isEmpty) {
              return response.sendStatus(404)
            }
          }

          const data = template.expand

          data.push({
            collection: 'template/items',
            id,
            item: template.item,
            metadata: template.metadata
          })

          request.pageData = {
            isEmpty: false,
            item: data,
            templates: [id]
          }

          next()
        },
        (request, response) => {
          pageCreate({ request, response })
        }
      ]
    })
  }
})

function getFiles (buildPaths) {
  for (let i = 0; i < buildPaths.length; i++) {
    const buildPath = buildPaths[i]
    const files = readdirSync(buildPath, {
      recursive: true,
      withFileTypes: true
    })

    // process all the action files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (file.isFile()) {
        templateBuild.actions.create(resolve(file.path, file.name))
      }
    }
  }
}

function parseActionItem (actionItems, actions, availableMethod) {
  for (let i = 0; i < actionItems.length; i++) {
    const action = actionItems[i]
    const id = action.id
    const items = {}
    const sequences = {}
    let blocks = {}

    actions[id] = {}
    items[id] = []

    for (let i = 0; i < action.sequence.length; i++) {
      const result = parseAction(action.sequence[i], availableMethod)

      if (!result) {
        continue
      }

      if (action.dependencies) {
        actions[id].dependencies = action.dependencies
      }

      items[id].push(result.sequenceId)
      sequences[result.sequenceId] = result.sequences
      blocks = Object.assign(blocks, result.blocks)
    }

    actions[id].items = items
    actions[id].sequences = sequences
    actions[id].blocks = blocks
  }
}

function processTemplates (file, actions) {
  const fragment = JSDOM.fragment(file)
  const templates = fragment.querySelectorAll('template[ds-template-id]')

  if (!templates) {
    const templates = fragment.querySelectorAll('template')

    if (templates) {
      throw new Error('Templates missing the "ds-template-id" attribute')
    }

    throw new Error('No templates found')
  }

  for (let i = 0; i < templates.length; i++) {
    const html = templates[i]

    processHTML(html, actions)
  }
}

function processHTML (html, actions) {
  const template = parseHTML(html)

  // Store used action collection
  template.actions = []

  for (let i = 0; i < template.content.length; i++) {
    const items = template.content[i]

    for (let j = 0; j < items.length; j++) {
      const node = items[j]
      const nodeName = node.nodeName.toLowerCase()
      const component = $component(nodeName)
      const getters = $componentGetter(nodeName)
      const content = {
        item: { values: {} },
        type: component.type
      }

      // get node value
      if (getters) {
        for (let i = 0; i < getters.length; i++) {
          const getter = getters[i]
          const result = getNodeValue(node, getter.type, getter.name, getter.token)

          content.item.values[getter.property] = result.value

          if (getter.token) {
            if (!content.item.tokens) {
              content.item.tokens = {}
            }

            content.item.tokens[getter.property] = result.token
          }
        }
      }

      items[j] = content
    }
  }

  // add layouts
  for (let i = 0; i < template.layout.length; i++) {
    const layout = template.layout[i]
    const layoutId = template.layoutId[i]

    $setDataValue('layout/items', layout, {
      id: layoutId
    })
  }

  // Add used actions by widget
  for (let i = 0; i < template.widgetEvent.length; i++) {
    const widgetEvent = template.widgetEvent[i]

    for (const key in widgetEvent) {
      if (Object.hasOwnProperty.call(widgetEvent, key)) {
        const events = widgetEvent[key]

        for (let i = 0; i < events.length; i++) {
          const event = events[i]

          for (let i = 0; i < event.value.length; i++) {
            const actionId = event.value[i]

            if (actions[actionId]) {
              processActions(template, actions, actionId)
            }
          }
        }
      }
    }
  }

  $setDataValue('component/items', template.component, {
    merge: true
  })

  const result = $setDataValue('template/items', {
    actions: template.actions,
    content: template.content,
    contentRefs: template.contentRefs,
    eventListeners: template.eventListeners,
    layout: template.layout,
    layoutId: template.layoutId,
    queryIndexes: template.queryIndexes,
    section: template.section,
    sectionRefs: template.sectionRefs,
    widgetEvent: template.widgetEvent,
    widgetSection: template.widgetSection
  }, {
    id: template.id
  })

  return {
    id: result.id,
    mode: template.mode
  }
}

function processActions (template, actions, actionId) {
  const action = actions[actionId]
  const item = { items: actionId }

  // process dependencies
  if (action.dependencies) {
    for (let i = 0; i < action.dependencies.length; i++) {
      processActions(template, actions, action.dependencies[i])
    }

    item.dependencies = action.dependencies
  }

  $setDataValue('action/blocks', action.blocks, { merge: true })
  $setDataValue('action/items', action.items[actionId], { id: actionId })
  $setDataValue('action/sequences', action.sequences, { merge: true })

  item.blocks = Object.keys(action.blocks)
  item.sequences = Object.keys(action.sequences)
  template.actions.push(item)
}

export default templateBuild
