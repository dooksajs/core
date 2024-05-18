import createPlugin from '@dooksa/create-plugin'
import { layoutCreate, widgetRemove, queryFetch, $getDataValue, $setDataValue, $emit } from './index.js'

/**
 * @typedef {import('../../global-typedef.js').SetDataOptions} SetDataOptions
 */

/**
 * @param {*} queryId
 * @param {*} viewId
 * @param {*} id
 * @param {*} uniqueId
 * @param {*} mode
 * @returns
 */
function updateByQuery (queryId, viewId, id, uniqueId, mode) {
  const result = queryFetch({ id: queryId })

  // Exit, nothing to do.
  if (!result) {
    return
  }

  const viewData = $getDataValue('view/items', { id: viewId })
  const view = viewData.item
  // remove old nodes

  for (let i = 0; i < view.children.length; i++) {
    view.children[i].remove()
    --i
  }

  for (let i = 0; i < result.length; i++) {
    const item = result[i]
    const widgetId = item.widgetId
    const widgetView = $getDataValue('widget/parentViews', {
      id: widgetId,
      options: {
        expand: true
      }
    })

    if (!widgetView.isEmpty) {
      // reattach existing nodes
      for (let i = 0; i < widgetView.expand.length; i++) {
        const node = widgetView.expand[i].item

        view.appendChild(node)
      }
    } else {
      let widgetMode = $getDataValue('widget/mode', {
        id: widgetId,
        prefixId: uniqueId
      }).item
      widgetMode = widgetMode !== 'default' ? widgetMode : mode
      const layoutId = $getDataValue('widget/layouts', {
        id: widgetId,
        suffixId: widgetMode,
        prefixId: uniqueId
      }).item

      // create new widget layout and attach to section
      layoutCreate({
        layoutId,
        sectionId: id,
        sectionUniqueId: uniqueId,
        widgetId,
        widgetMode,
        viewId
      })
    }
  }
}

const section = createPlugin({
  name: 'section',
  models: {
    uniqueId: {
      type: 'string'
    },
    items: {
      type: 'collection',
      prefixId () {
        return $getDataValue('widget/uniqueId').item
      },
      suffixId: 'default',
      items: {
        type: 'array',
        items: {
          type: 'string',
          relation: 'widget/items'
        }
      }
    },
    mode: {
      type: 'collection',
      items: {
        type: 'string'
      }
    },
    query: {
      type: 'collection',
      prefixId () {
        return $getDataValue('widget/uniqueId').item
      },
      suffixId: 'default',
      items: {
        type: 'string',
        relation: 'query/items'
      }
    },
    view: {
      type: 'collection',
      items: {
        type: 'string',
        relation: 'view/items'
      }
    }
  },
  actions: {
    append ({
      id,
      viewId = $getDataValue('view/rootViewId').item
    }) {
      const sectionUniqueId = $getDataValue('section/uniqueId').item
      const mode = $getDataValue('section/mode', {
        id,
        prefixId: sectionUniqueId
      }).item

      const section = $getDataValue('section/items', {
        id,
        prefixId: sectionUniqueId,
        suffixId: mode
      })

      if (section.isEmpty) {
        return
      }

      $setDataValue('section/view', viewId, {
        id,
        prefixId: sectionUniqueId,
        suffixId: mode
      })

      // event context
      const widgets = []

      for (let i = 0; i < section.item.length; i++) {
        const widgetId = section.item[i]
        let widgetMode = $getDataValue('widget/mode', {
          id: widgetId,
          prefixId: sectionUniqueId
        }).item
        widgetMode = widgetMode !== 'default' ? widgetMode : mode
        const layoutId = $getDataValue('widget/layouts', {
          id: widgetId,
          suffixId: widgetMode,
          prefixId: sectionUniqueId
        }).item

        widgets.push(widgetId)

        layoutCreate({
          layoutId,
          sectionId: id,
          sectionUniqueId,
          widgetId,
          widgetMode,
          viewId
        })
      }

      $emit('section/attach', {
        id: viewId,
        context: {
          sectionId: id,
          viewId,
          widgets
        }
      })

      return section
    },
    render ({
      id,
      viewId,
      uniqueId,
      mode
    }) {
      if (!viewId) {
        const view = $getDataValue('section/view', {
          id
        })

        if (view.isEmpty) {
          throw new Error('viewId is undefined')
        }

        viewId = view.item
      }

      if (!mode) {
        uniqueId = $getDataValue('section/uniqueId').item
        mode = $getDataValue('section/mode', { id, prefixId: uniqueId }).item
      }

      const section = $getDataValue('section/items', { id })
      const previousWidgets = {}
      const nextItems = section.item
      const prevItems = section.previous ? section.previous._item : []

      for (let i = 0; i < prevItems.length; i++) {
        const prevWidgetId = prevItems[i]
        const nextIndex = nextItems.indexOf(prevWidgetId)

        /**
         * @todo (Render benchmarking needed) Avoid reattaching unchanged
         * nodes by preparing a before/after list
         */
        // detach previous nodes
        if (nextIndex === -1) {
          const attachedSection = $getDataValue('widget/attached', { id: prevWidgetId })

          // complete remove widget since it belongs to no section
          if (attachedSection.item === section.id) {
            widgetRemove(prevWidgetId)
          }
        } else {
          const previousView = $getDataValue('widget/parentViews', {
            id: prevWidgetId,
            options: {
              expand: true
            }
          })

          if (!previousView.isExpandEmpty) {
            previousWidgets[nextIndex] = []

            for (let i = 0; i < previousView.expand.length; i++) {
              const node = previousView.expand[i].item

              node.remove()

              previousWidgets[nextIndex].push(node)
            }
          }
        }
      }

      const sectionNode = $getDataValue('view/items', {
        id: viewId
      })

      for (let i = 0; i < nextItems.length; i++) {
        const previousWidget = previousWidgets[i]

        // reattach existing node
        if (previousWidget) {
          for (let i = 0; i < previousWidget.length; i++) {
            const node = previousWidget[i]

            sectionNode.item.appendChild(node)
          }
        } else {
          const widgetId = nextItems[i]
          let widgetMode = $getDataValue('widget/mode', {
            id: widgetId,
            prefixId: uniqueId
          }).item
          widgetMode = widgetMode !== 'default' ? widgetMode : mode
          const layoutId = $getDataValue('widget/layouts', {
            id: widgetId,
            suffixId: widgetMode,
            prefixId: uniqueId
          }).item

          layoutCreate({
            layoutId,
            sectionId: id,
            sectionUniqueId: uniqueId,
            widgetId,
            widgetMode,
            viewId
          })
        }
      }

      return nextItems
    },
    /**
     * Set section data items
     * @param {Object} param
     * @param {string|string[]} param.value
     * @param {SetDataOptions} param.options
     */
    set ({ value, options }) {
      if (options && options.id){
        const id = options.id
        const view = $getDataValue('section/view', { id })

        // update attached widgets since there is no dataListener yet
        if (view.isEmpty) {
          if (typeof value === 'string') {
            $setDataValue('widget/attached', id, { id: value })
          } else {
            for (let i = 0; i < value.length; i++) {
              $setDataValue('widget/attached', id, { id: value[i] })
            }
          }
        }
      }

      $setDataValue('section/items', value, options)
    },
    update ({ id, viewId }) {
      const query = $getDataValue('section/query', { id })
      const uniqueId = $getDataValue('section/uniqueId').item
      const mode = $getDataValue('section/mode', {
        id,
        prefixId: uniqueId
      }).item

      if (!query.isEmpty) {
        return updateByQuery(query.item, viewId, id, uniqueId, mode)
      }

      const widgets = this.render({ id, viewId, uniqueId, mode })

      $emit('section/update', {
        id: viewId,
        context: {
          sectionId: id,
          viewId,
          widgets
        }
      })
    }
  }
})

const sectionAppend = section.actions.append
const sectionRender = section.actions.render
const sectionUpdate = section.actions.update

export {
  sectionAppend,
  sectionRender,
  sectionUpdate
}

export default section
