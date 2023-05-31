import PocketBase from 'pocketbase'

/**
 * @namespace dsDatabase
 */
export default {
  name: 'dsDatabase',
  version: 1,
  data: {
    client: {
      private: true,
      default: {}
    }
  },
  setup ({ baseUrl = 'https://no.dooksa.com', lang = 'en-US' }) {
    this.client = new PocketBase(baseUrl, lang)
  },
  /** @lends dsDatabase */
  methods: {
    /**
     * Get a list of documents
     * @param {Object} param 
     * @param {string} param.collection - ID or name of the records' collection.
     * @param {number} param.page - The page (aka. offset) of the paginated list (default to 1).
     * @param {number} param.perPage - The max returned records per page (default to 25).
     */
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
