import createPlugin from '@dooksa/create-plugin'
import { $getDataValue, $addDataListener } from '../data.js'
import Collapse from 'bootstrap/js/src/collapse.js'

/** @type {Object.<string, Collapse>} */
const collapseItems = {}

const bootstrapCollapse = createPlugin({
  name: 'bootstrapCollapse',
  actions: {
    create ({ id, parentId, toggle = true }) {
      if (collapseItems[id]) {
        return collapseItems[id]
      }

      let parent = null

      if (parentId) {
        parent = $getDataValue('component/items', { id: parentId }).item
      }

      const element = $getDataValue('component/nodes', { id })

      if (element.isEmpty) {
        throw new Error('Component not found: ' + id)
      }

      // create collapse instance
      const collapseInstance = new Collapse(element.item, {
        toggle,
        parent
      })

      // set collapse cache
      collapseItems[id] = collapseInstance

      // clean up
      $addDataListener('component/node', {
        on: 'delete',
        id,
        handler () {
          collapseItems[id].dispose()

          delete collapseItems[id]
        }
      })

      return collapseInstance
    },
    show ({ id }) {
      const collapse = collapseItems[id]

      if (collapse) {
        collapse.show()
      }
    },
    hide ({ id }) {
      const collapse = collapseItems[id]

      if (collapse) {
        collapse.hide()
      }
    },
    toggle ({ id }) {
      const collapse = collapseItems[id]

      if (collapse) {
        collapse.toggle()
      }
    }
  }
})

const bootstrapCollapseCreate = bootstrapCollapse.actions.create
const bootstrapCollapseHide = bootstrapCollapse.actions.hide
const bootstrapCollapseShow = bootstrapCollapse.actions.show
const bootstrapCollapseToggle = bootstrapCollapse.actions.toggle

export {
  bootstrapCollapse,
  bootstrapCollapseCreate,
  bootstrapCollapseHide,
  bootstrapCollapseShow,
  bootstrapCollapseToggle
}

export default bootstrapCollapse
