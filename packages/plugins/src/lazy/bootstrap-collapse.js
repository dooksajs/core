import createPlugin from '@dooksa/create-plugin'
import { dataGetValue, dataAddListener } from '../data.js'
import Collapse from 'bootstrap/js/src/collapse.js'

/** @type {Object.<string, Collapse>} */
const collapseItems = {}

const bootstrapCollapse = createPlugin('bootstrapCollapse', {
  actions: {
    /**
     * @param {Object} param
     * @param {string} param.id - Collapsable node
     * @param {string} param.parentId - If parent is provided, then all collapsible elements under the specified parent will be closed when this collapsible item is shown. (similar to traditional accordion behavior - this is dependent on the card class). The attribute has to be set on the target collapsible area. {@link https://getbootstrap.com/docs/5.3/components/collapse/#options}
     * @param {string} param.collapseId - If present this id will be used as the reference rather than the component item id
     * @param {boolean} param.toggle - Toggles the collapsible element on invocation.  {@link https://getbootstrap.com/docs/5.3/components/collapse/#options}
     */
    create ({ id, parentId, collapseId, toggle = false }) {
      collapseId = collapseId || id

      if (collapseItems[collapseId]) {
        return collapseItems[collapseId]
      }

      let parent = null

      if (parentId) {
        parent = dataGetValue({ name: 'component/nodes', id: parentId }).item
      }

      const element = dataGetValue({ name: 'component/nodes', id })

      if (element.isEmpty) {
        throw new Error('Component not found: ' + id)
      }

      // create collapse instance
      const collapseInstance = new Collapse(element.item, {
        toggle,
        parent
      })

      // set collapse cache
      collapseItems[collapseId] = collapseInstance

      // clean up
      dataAddListener({
        name: 'component/nodes',
        on: 'delete',
        id,
        handler () {
          collapseItems[collapseId].dispose()

          delete collapseItems[collapseId]
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
