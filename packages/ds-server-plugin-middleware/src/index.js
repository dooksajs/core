/**
 * Error handler for Dooksa plugins
 * @namespace dsMiddleware
 */
export default {
  name: 'dsMiddleware',
  version: 1,
  data: {
    items: {
      schema: {
        type: 'collection',
        items: {
          type: 'function'
        }
      }
    }
  },
  setup () {
    this.$setDataValue('dsMiddleware/items', this._checkBody, {
      id: 'request/checkBody'
    })

    this.$setDataValue('dsMiddleware/items', this._queryIsArray, {
      id: 'request/queryIsArray'
    })
  },
  methods: {
    _checkBody (request, response, next) {
      if (Object.getPrototypeOf(request.body) !== Object.prototype || !Object.keys(request.body).length) {
        return response.status(400).send({
          message: 'Missing data'
        })
      }

      next()
    },
    _queryIsArray (request, response, next) {
      const query = request.query.id

      if (!Array.isArray(query)) {
        if (query) {
          request.query.id = [query]
        } else {
          return response.status(400).send({
            details: {
              message: 'Query is undefined'
            },
            name: 'noQuery'
          })
        }
      }

      next()
    }
  }
}
