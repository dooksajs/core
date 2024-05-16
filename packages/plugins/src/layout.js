import createPlugin from '@dooksa/create-plugin'
import {
  viewUpdateValue,
  viewInsert,
  viewCreateNode,
  $getDataValue,
  $addDataListener,
  $setDataValue,
  $emit,
  routerCurrentId,
  sectionAppend,
  sectionUpdate
} from './index.js'

const eventNames = {
  'section-attach': 'section/attach',
  'section-update': 'section/update',
  'view-mount': 'view/mount',
  'view-unmount': 'view/unmount',
  'layout-mount': 'layout/mount'
}

function getItems (layoutId, widgetId, widgetMode) {
  const layout = $getDataValue('layout/items', {
    id: layoutId
  })

  const events = $getDataValue('widget/events', {
    id: widgetId,
    suffixId: widgetMode
  }).item || {}

  const listeners = $getDataValue('layout/eventListeners', {
    id: layoutId
  }).item || {}

  const parentViewItems = $getDataValue('widget/parentViews', {
    id: widgetId,
    suffixId: widgetMode
  })

  const viewItems = $getDataValue('widget/views', {
    id: widgetId,
    suffixId: widgetMode
  })

  return {
    items: layout.item,
    events,
    listeners,
    viewItems: viewItems.item || [],
    parentViewItems: parentViewItems.item || []
  }
}

function contentItem (widgetId, widgetMode, sectionUniqueId, viewId, childViewId, contentIndex) {
  const language = $getDataValue('metadata/currentLanguage').item
  // @TODO check if widgetContentId and contentId are the same
  const widgetContentId = $getDataValue('widget/content', {
    id: widgetId,
    prefixId: sectionUniqueId,
    suffixId: widgetMode,
    options: {
      position: contentIndex
    }
  }).item
  const contentId = $getDataValue('content/items', {
    id: widgetContentId,
    suffixId: language
  }).id

  // Associate content with view item
  $setDataValue('view/content', contentId, {
    id: childViewId
  })

  viewUpdateValue({ viewId: childViewId })

  // Update view item if content value changes
  $addDataListener('content/items', {
    on: 'update',
    id: contentId,
    handler: {
      id: viewId,
      value: () => {
        viewUpdateValue({ viewId: childViewId })
      }
    }
  })
}

function eventItem (event, id) {
  // match core event names with namespaced core plugins
  const eventName = eventNames[event.name] || event.name
  const eventItem = $setDataValue('event/listeners', event.value, {
    id,
    suffixId: eventName
  })

  // Store used events on page used by "save page"
  // ISSUE: not sure if this is needed since schema relation
  $setDataValue('page/events', eventItem.id, {
    id: routerCurrentId(),
    update: {
      method: 'push'
    }
  })
}

function sectionItem (widgetId, widgetMode, sectionUniqueId, viewId, sectionIndex) {
  // get next widget section id
  const widgetSectionItem = $getDataValue('widget/sections', {
    id: widgetId,
    prefixId: sectionUniqueId,
    suffixId: widgetMode,
    options: {
      position: sectionIndex
    }
  })

  // ISSUE: this can't be empty
  if (!widgetSectionItem.isEmpty) {
    sectionAppend({
      id: widgetSectionItem.item,
      viewId
    })

    const sectionItem = $getDataValue('section/items', { id: widgetSectionItem.item })
    const sectionItemId = sectionItem.id

    $setDataValue('widget/attached', sectionItemId, {
      id: widgetId,
      prefixId: sectionUniqueId,
      suffixId: widgetMode
    })

    // update widget section attachment
    $addDataListener('section/items', {
      on: 'update',
      id: sectionItemId,
      force: true,
      handler: {
        id: viewId,
        value: ({ item }) => {
          for (let i = 0; i < item.length; i++) {
            $setDataValue('widget/attached', sectionItemId, { id: item[i] })
          }
        }
      }
    })

    const handlerValue = (e) => {
      sectionUpdate({ id: sectionItemId, viewId })
    }

    // update section elements
    $addDataListener('section/items', {
      on: 'update',
      id: sectionItemId,
      handler: {
        id: viewId,
        value: handlerValue
      }
    })

    $addDataListener('section/query', {
      on: 'update',
      id: sectionItemId,
      handler: {
        id: viewId,
        value: handlerValue
      }
    })

    $addDataListener('section/query', {
      on: 'delete',
      id: sectionItemId,
      handler: {
        id: viewId,
        value: handlerValue
      }
    })

    return sectionItemId
  }
}

const layout = createPlugin({
  name: 'layout',
  models: {
    items: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['componentId'],
          properties: {
            contentIndex: { type: 'number' },
            parentIndex: { type: 'number' },
            children: {
              type: 'array',
              items: { type: 'number' }
            },
            componentId: {
              type: 'string',
              relation: 'component/items'
            }
          }
        }
      }
    },
    eventListeners: {
      type: 'collection',
      items: {
        type: 'object',
        patternProperties: {
          '^[0-9]+$': {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  actions: {
    create ({
      layoutId,
      sectionId,
      sectionUniqueId,
      widgetId,
      widgetMode,
      viewId
    }) {
      const {
        items,
        events,
        listeners,
        viewItems,
        parentViewItems
      } = getItems(layoutId, widgetId, widgetMode)
      const layoutItems = []

      // attach existing nodes
      if (parentViewItems.length) {
        for (let i = 0; i < parentViewItems.length; i++) {
          const sourceId = parentViewItems[i]

          viewInsert({
            sourceId,
            targetId: viewId,
            widgetId,
            widgetMode
          })
        }

        return
      }

      for (let i = 0; i < items.length; i++) {
        const element = items[i]
        const listener = listeners[i]
        const item = {}
        const isSection = !!Number.isInteger(element.sectionIndex)
        let event = events[i] || []
        let parentViewId = viewId
        let sectionItemId = sectionId
        let isChild = true

        layoutItems.push(item)

        if (Number.isInteger(element.parentIndex)) {
          const layoutItem = layoutItems[element.parentIndex]

          parentViewId = layoutItem.viewId

          if (layoutItem.sectionId) {
            sectionItemId = layoutItem.sectionId
          }

          $setDataValue('widget/attached', sectionItemId, {
            id: widgetId,
            prefixId: sectionUniqueId,
            suffixId: widgetMode
          })
        } else {
          $setDataValue('widget/attached', sectionItemId, {
            id: widgetId,
            prefixId: sectionUniqueId,
            suffixId: widgetMode
          })

          isChild = false
        }

        const childViewId = viewCreateNode({
          viewId: viewItems[i],
          sectionId: sectionItemId,
          widgetId,
          componentId: element.componentId
        })

        if (!isChild) {
          parentViewItems.push(childViewId)
        }

        // Collect elements
        viewItems.push(childViewId)

        item.viewId = childViewId

        if (Number.isInteger(element.contentIndex)) {
          contentItem(widgetId, widgetMode, sectionUniqueId, viewId, childViewId, element.contentIndex)
        }

        if (isSection) {
          $setDataValue('event/handlers', () => {
            $emit('section/attach', {
              id: childViewId,
              context: {
                viewId,
                widgetId,
                sectionId: sectionItemId
              }
            })
          }, {
            id: childViewId,
            update: {
              method: 'push'
            }
          })

          $setDataValue('event/handlers', () => {
            $emit('section/update', {
              id: childViewId,
              context: {
                viewId,
                widgetId,
                sectionId: sectionItemId
              }
            })
          }, {
            id: childViewId,
            update: {
              method: 'push'
            }
          })

          if (event) {
            event = event.slice()

            for (let i = 0; i < event.length; i++) {
              const item = event[i]

              if (item.name === 'section-attach' || item.name === 'section-update') {
                eventItem(item, childViewId)
                event.splice(i, 0)
              }
            }
          }

          sectionItem(widgetId, widgetMode, sectionUniqueId, childViewId, element.sectionIndex)
        }

        for (let i = 0; i < event.length; i++) {
          const item = event[i]

          eventItem(item, childViewId)
        }

        // only include if in edit mode
        // sectionMode || pageMode === 'edit'
        if (listener) {
          $setDataValue('widget/eventListeners', {
            types: listener,
            viewId: childViewId
          }, {
            id: widgetId,
            prefixId: sectionUniqueId,
            suffixId: widgetMode,
            update: {
              method: 'push'
            }
          })
        }

        viewInsert({
          sourceId: childViewId,
          targetId: parentViewId,
          widgetId,
          widgetMode
        })
      }

      $setDataValue('widget/views', viewItems, {
        id: widgetId,
        suffixId: widgetMode
      })

      $setDataValue('widget/parentViews', parentViewItems, {
        id: widgetId,
        suffixId: widgetMode
      })

      // fire layout mounted events
      for (let i = 0 ; i < viewItems.length; i++) {
        const viewId = viewItems[i]

        $emit('layout/mount', {
          id: viewId,
          context: {
            viewId,
            widgetId,
            sectionId
          }
        })
      }
    }
  }
})

const layoutCreate = layout.actions.create

export {
  layoutCreate
}

export default layout
