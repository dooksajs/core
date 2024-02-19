import { definePlugin } from '@dooksa/ds-scripts'

/**
 * @typedef {import('@dooksa/ds-scripts/src/types.js').DsDataWhere} DsDataWhere
 */

/**
 * @namespace dsDatabase
 */
export default definePlugin({
  name: 'dsDatabase',
  version: 1,
  data: {
    hostname: {
      private: true,
      default: () => 'http://localhost:6362/_/'
    }
  },
  setup ({ hostname } = {}) {
    if (hostname) {
      this.hostname = hostname + '/_/'
    }
  },
  methods: {
    create ({ collection, id, data, options = {} }) {
      return new Promise((resolve, reject) => {
        this.getOne({ collection, id, options })
          .then(response => {
            this.update({
              collection,
              id: response.id,
              data,
              options
            })
              .then((result) => resolve(result))
              .catch((error) => reject(error))
          })
          .catch(response => {
            if (response.code === 404) {
              // create new entry
              this.$action(this.createName, {
                collection,
                data,
                options
              },
              {
                onSuccess: (result) => resolve(result),
                onError: (error) => reject(error)
              })
            }
          })
      })
    },
    delete ({ collection, id }) {
      return new Promise((resolve, reject) => {
        this.$action(this.deleteName, {
          collection,
          id
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error)
        })
      })
    },
    /**
     * Get a list of documents
     * @param {Object} param
     * @param {string} param.collection - Name of the records' collection.
     * @param {number} [param.expand] - Fetch related documents.
     * @param {number} [param.page] - The page (aka. offset) of the paginated list (default to 1).
     * @param {number} [param.perPage] - The max returned records per page (default to 25).
     * @param {number} [param.limit] - The max returned records per page (default to 25).
     * @param {DsDataWhere} [param.where] -
     */
    getAll ({ collection, page, perPage, limit, where, expand }) {
      return new Promise((resolve, reject) => {
        if (!collection) {
          throw new Error('Collection was not defined')
        }

        const and = '&'
        let query = '?'
        let firstQuery = true

        if (page) {
          if (firstQuery) {
            firstQuery = false
            query += and
          }

          query += 'page=' + page
        }

        if (perPage) {
          if (firstQuery) {
            firstQuery = false
            query += and
          }

          query += 'perPage=' + perPage
        }

        if (limit) {
          if (firstQuery) {
            firstQuery = false
            query += and
          }

          query += 'limit=' + limit
        }

        if (where) {
          if (firstQuery) {
            firstQuery = false
            query += and
          }

          query += 'where=' + where
        }

        if (expand) {
          if (firstQuery) {
            firstQuery = false
            query += and
          }

          query += expand
        }

        // reset query
        if (query === '?') {
          query = ''
        }

        fetch(this.hostname + collection + query)
          .then(docs => {
            resolve(docs)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    getById ({ collection, id, expand }) {
      return new Promise((resolve, reject) => {
        if (!collection) {
          throw new Error('Collection was not defined')
        }
        if (!Array.isArray(id) && !id.length) {
          reject(new Error('Document id was not defined'))
        }

        let query = '?id=' + id[0]

        for (let i = 1; i < id.length; i++) {
          const value = id[i]

          query += '&id=' + value
        }

        if (expand) {
          query += '&expand=true'
        }

        fetch(this.hostname + collection + query)
          .then(response => {
            if (response.ok) {
              resolve(response.json())
            }

            resolve(false)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    update ({ collection, id, data }) {
      return new Promise((resolve, reject) => {
        this.$action(this.updateName, {
          collection,
          id,
          data
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error)
        })
      })
    },

    _updateNames () {
      this.createName = this.adapter + '/' + this.createName
      this.deleteName = this.adapter + '/' + this.deleteName
      this.getListName = this.adapter + '/' + this.getListName
      this.getOneName = this.adapter + '/' + this.getOneName
      this.updateName = this.adapter + '/' + this.updateName
    }
  }
})
