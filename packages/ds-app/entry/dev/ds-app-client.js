import dsAppClient from '@dooksa/ds-app-client'

const eventSource = new window.EventSource('/_/esbuild')

eventSource.addEventListener('rebuild-client', () => {
  window.location.reload()
})

const data = __ds__ // eslint-disable-line

dsAppClient.start({
  isDev: true
}, {
  onSuccess: app => {
    if (data.isEmpty) {
      return
    }

    // set data
    for (let i = 0; i < data.item.length; i++) {
      const item = data.item[i]

      // need to check if any data requires an async plugin
      app.$setDataValue(item.collection, item.item, {
        id: item.id,
        metadata: item.metadata
      })
    }

    const page = app.$getDataValue('dsPage/items', {
      id: window.location.pathname
    })

    if (!page.isEmpty) {
      // Render page
      for (let i = 0; i < page.item.length; i++) {
        app.$method('dsSection/append', { id: page.item[i] })
      }

      return
    }

    if (data.templates) {
      const currentPath = app.$method('dsRouter/currentPath')

      for (let i = 0; i < data.templates.length; i++) {
        const templateId = data.templates[i]
        const dsSectionId = app.$method('dsTemplate/create', { id: templateId })

        app.$setDataValue('dsPage/items', dsSectionId, {
          id: currentPath,
          update: {
            method: 'push'
          }
        })
      }

      const page = app.$getDataValue('dsPage/items', {
        id: window.location.pathname
      })

      if (!page.isEmpty) {
        for (let i = 0; i < page.item.length; i++) {
          app.$method('dsSection/append', { id: page.item[i] })
        }
      }
    }
  },
  onError: (e) => {
    console.error(e)
  }
})
