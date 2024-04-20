import dsAppClient from '@dooksa/ds-app-client'

((data) => {
  const eventSource = new window.EventSource('/_/esbuild')

  eventSource.addEventListener('rebuild-client', () => {
    window.location.reload()
  })

  eventSource.addEventListener('rebuild-server', () => {
    window.location.reload()
  })

  dsAppClient.start({
    isDev: true
  }, {
    onSuccess: app => {
      if (data.isEmpty) {
        return
      }

      const currentPathId = app.$method('dsRouter/currentId')

      // set data
      for (let i = 0; i < data.item.length; i++) {
        const item = data.item[i]

        // need to check if any data requires an async plugin
        app.$setDataValue(item.collection, item.item, {
          id: item.id,
          metadata: item.metadata
        })
      }

      const section = app.$getDataValue('dsSection/items', {
        id: currentPathId
      })

      if (!section.isEmpty) {
        // Render page
        app.$method('dsSection/append', { id: section.id })

        return
      }

      if (data.templates) {
        for (let i = 0; i < data.templates.length; i++) {
          const templateId = data.templates[i]

          app.$action('dsTemplate/create', { id: templateId }, {
            onSuccess: (dsWidgetId) => {
              app.$setDataValue('dsSection/items', dsWidgetId, {
                id: currentPathId,
                suffixId: 'default',
                update: {
                  method: 'push'
                }
              })
            }
          })

          const section = app.$getDataValue('dsSection/items', {
            id: currentPathId
          })

          if (!section.isEmpty) {
            const id = section.id

            app.$method('dsSection/append', { id })

            const dsViewId = app.$getDataValue('dsView/rootViewId').item
            const handlerValue = () => {
              app.$method('dsSection/update', { id, dsViewId })
            }

            // update section elements
            app.$addDataListener('dsSection/items', {
              on: 'update',
              id,
              handler: {
                id: dsViewId,
                value: handlerValue
              }
            })

            // update widget section attachment
            app.$addDataListener('dsSection/items', {
              on: 'update',
              id,
              force: true,
              priority: 0,
              handler: {
                id: dsViewId,
                value: ({ item }) => {
                  for (let i = 0; i < item.length; i++) {
                    app.$setDataValue('dsWidget/attached', id, { id: item[i] })
                  }
                }
              }
            })

            app.$addDataListener('dsSection/query', {
              on: 'update',
              id,
              handler: {
                id: dsViewId,
                value: handlerValue
              }
            })

            app.$addDataListener('dsSection/query', {
              on: 'delete',
              id,
              handler: {
                id: dsViewId,
                value: handlerValue
              }
            })
          }
        }
      }
    },
    onError: (e) => {
      console.error(e)
    }
  })
})(__ds__)
