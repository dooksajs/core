// import dsAppServer from '@dooksa/ds-app-server'
import dsAppClient from '@dooksa/ds-app-client'

const data = window.dsData ? window.dsData.slice() : []
delete window.dsData

dsAppClient.start({
  isDev: false
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
