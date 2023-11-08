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
    for (let i = 0; i < data.length; i++) {
      const e = data[i]
      app.$setDataValue(e.collection, e.item, {
        id: e.id,
        metadata: e.metadata
      })
    }

    if (data[0] && data[0].collection === 'dsPage/items') {
      for (let i = 0; i < data[0].item.length; i++) {
        app.$method('dsSection/create', { id: data[0].item[i] })
      }
    }
  },
  onError: (e) => {
    console.error(e)
  }
})
