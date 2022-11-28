import PocketBase from 'pocketbase'

let client

export default {
  name: 'dsDatabase',
  version: 1,
  setup ({ baseUrl = 'https://no.dooksa.com', lang = 'en-US' }) {
    client = new PocketBase(baseUrl, lang)
  },
  methods: {
    getList ({ collection, page = 1, perPage = 25, options = {} }) {
      return new Promise((resolve, reject) => {
        client.records.getList(collection, page, perPage, options)
          .then(records => resolve(records))
          .catch(error => reject(error))
      })
    },
    getOne ({ collection, id, options = {} }) {
      return new Promise((resolve, reject) => {
        client.records.getOne(collection, id, options)
          .then(record => resolve(record))
          .catch(error => reject(error))
      })
    },
    create ({ collection, data, options = {} }) {
      // add a modal check
      return new Promise((resolve, reject) => {
        client.records.create(collection, data, options)
          .then(record => resolve(record))
          .catch(error => reject(error))
      })
    },
    update ({ collection, id, data }) {
      // add a modal check
      return new Promise((resolve, reject) => {
        client.records.update(collection, id, data)
          .then(record => resolve(record))
          .catch(error => reject(error))
      })
    },
    delete ({ collection, id }) {
      return new Promise((resolve, reject) => {
        client.records.delete(collection, id)
          .then(() => resolve('OK'))
          .catch(error => reject(error))
      })
    }
  }
}
