import definePlugin from '../definePlugin'

/**
 * @namespace dsDatabase
 */
export default definePlugin({
  name: 'dsDatabase',
  version: 1,
  data: {
    adapter: {
      private: true,
      default: () => 'dsDatabaseLocal'
    },
    createName: {
      private: true,
      default: () => 'create'
    },
    deleteName: {
      private: true,
      default: () => 'delete'
    },
    getListName: {
      private: true,
      default: () => 'getList'
    },
    getOneName: {
      private: true,
      default: () => 'getOne'
    },
    updateName: {
      private: true,
      default: () => 'update'
    }
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
        this.$action(this.getListName,
          { collection, page, perPage, options },
          {
            onSuccess: (result) => resolve(result),
            onError: (error) => reject(error)
          })
      })
    },
    getOne ({ collection, id, options = {} }) {
      return new Promise((resolve, reject) => {
        this.$action(this.getOneName, {
          collection,
          id,
          options
        },
        {
          onSuccess: (result) => resolve(result),
          onError: (error) => reject(error)
        })
      })
    },
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
    _updateNames () {
      this.createName = this.adapter + '/' + this.createName
      this.deleteName = this.adapter + '/' + this.deleteName
      this.getListName = this.adapter + '/' + this.getListName
      this.getOneName = this.adapter + '/' + this.getOneName
      this.updateName = this.adapter + '/' + this.updateName
    }
  }
})
