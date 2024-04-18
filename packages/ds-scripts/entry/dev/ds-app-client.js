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

      const currentPathId = app.$method('dsRouter/currentId') + 'default'

      // set data
      for (let i = 0; i < data.item.length; i++) {
        const item = data.item[i]

        // need to check if any data requires an async plugin
        app.$setDataValue(item.collection, item.item, {
          id: item.id,
          metadata: item.metadata
        })
      }

      const widget = app.$getDataValue('dsSection/items', {
        id: currentPathId
      })

      if (!widget.isEmpty) {
        // Render page
        app.$method('dsSection/append', { id: currentPathId })

        return
      }

      if (data.templates) {
        for (let i = 0; i < data.templates.length; i++) {
          const templateId = data.templates[i]
          app.$action('dsTemplate/create', { id: templateId }, {
            onSuccess: (dsWidgetId) => {
              app.$setDataValue('dsSection/items', dsWidgetId, {
                id: currentPathId,
                update: {
                  method: 'push'
                }
              })
            }
          })

          const widget = app.$getDataValue('dsSection/items', {
            id: currentPathId
          })

          if (!widget.isEmpty) {
            app.$method('dsSection/append', { id: currentPath })
          }
        }
      }
    },
    onError: (e) => {
      console.error(e)
    }
  })
})(__ds__)
