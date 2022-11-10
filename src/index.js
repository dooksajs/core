export default {
  name: 'dsDatabase',
  version: 1,
  data: {
    client: {}
  },
  setup ({ baseUrl = 'https://no.dooksa.com', lang = 'en-US' }) {
    return new Promise((resolve, reject) => {
      import('pocketbase')
        .then(({ default: PocketBase }) => {
          this.client = new PocketBase(baseUrl, lang)
          resolve()
        })
        .catch(e => reject(e))
    })
  },
  methods: {
    getList ({ collection, page = 1, perPage = 25, options = {} }) {
      return new Promise((resolve, reject) => {
        this.client.records.getList(collection, page, perPage, options)
          .then(records => resolve(records))
          .catch(error => reject(error))
      })
    },
    getOne ({ collection, id, options = {} }) {
      return new Promise((resolve, reject) => {
        this.client.records.getOne(collection, id, options)
          .then(record => resolve(record))
          .catch(error => reject(error))
      })
    },
    create ({ collection, data, options = {} }) {
      // add a modal check
      return new Promise((resolve, reject) => {
        this.client.records.create(collection, data, options)
          .then(record => resolve(record))
          .catch(error => reject(error))
      })
    },
    update ({ collection, id, data }) {
      // add a modal check
      return new Promise((resolve, reject) => {
        this.client.records.update(collection, id, data)
          .then(record => resolve(record))
          .catch(error => reject(error))
      })
    },
    delete ({ collection, id }) {
      return new Promise((resolve, reject) => {
        this.client.records.delete(collection, id)
          .then(() => resolve('OK'))
          .catch(error => reject(error))
      })
    }
  }
}
