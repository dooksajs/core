import { Sequelize, DataTypes, Op } from 'sequelize'

/**
 * @namespace dsDatabase
 */
export default {
  name: 'dsDatabase',
  version: 1,
  data: {
    associationTypes: {
      private: true,
      default: {
        belongsTo: true,
        belongsToMany: true,
        hasOne: true,
        hasMany: true
      }
    },
    models: {
      private: true,
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'function'
        }
      }
    },
    sequelize: {
      private: true,
      default: false
    },
    operators: {
      private: true,
      default: {
        $and: Op.and,
        $like: Op.like,
        $or: Op.or
      }
    }
  },
  /**
   * Setup dsDatabase
   * @param {Object} options
   * @param {string} [options.database=] - path to the database
   * @param {string} [options.username=] - user name used to login to database
   * @param {string} [options.password=] - password to access the database
   * @param {string} [options.dialect=sqlite] - the sql dialect of the database; currently support: 'mysql', 'sqlite', 'postgres', 'mssql'
   * @param {string} [options.host=localhost] - custom host; default: localhost
   * @param {number|null} option.port - custom port; default: dialect default
   * @param {string} [options.protocol=tcp] - custom protocol; postgres only, useful for Heroku
   * @param {Function} [options.logging=console.log] - disable logging or provide a custom logging function; default: console.log
   * @param {Object|null} options.dialectOptions - you can also pass any dialect options to the underlying dialect library
   * @param {string} options.storage - the storage engine for sqlite
   * @param {boolean} [options.omitNull=false] - disable inserting undefined values as NULL
   * @param {boolean} [options.native=false] - a flag for using a native library or not.
   * @param {boolean} [options.ssl=false] - a flag that defines if connection should be over ssl or not
   * @param {Object} options.define - Specify options, which are used when sequelize.define is called.
   * @param {Object} options.sync - similar for sync: you can define this to always force sync for models
   * @param {Object} options.pool - pool configuration used to pool database connections
   */
  setup ({
    database = '',
    username = '',
    password = '',
    dialect = 'sqlite',
    host = 'localhost',
    port,
    protocol = 'tcp',
    logging = console.log,
    dialectOptions,
    storage = './db_data/database.db',
    omitNull = false,
    native = false,
    ssl = false,
    define,
    sync,
    pool
  }) {
    this.sequelize = new Sequelize(database, username, password, {
      dialect,
      host,
      port,
      protocol,
      logging,
      dialectOptions,
      storage,
      omitNull,
      native,
      ssl,
      define,
      sync,
      pool
    })
  },
  /** @lends dsDatabase */
  methods: {
    $getDatabaseValue (name, {
      type = 'findAll',
      options = {}
    }) {
      const Model = this._getDatabaseModel(name)

      if (options.hasOperators) {
        // traverse options.where
      }

      return Model[type](options)
    },
    $deleteDatabaseValue (name, options) {
      const Model = this._getDatabaseModel(name)

      return Model.destroy(options)
    },
    $setDatabaseAssociation (type, {
      source,
      target,
      options = {}
    }) {
      if (!this.associationTypes[type]) {
        throw new Error('No association type found')
      }

      const sourceModel = this.models[source]

      if (!sourceModel) {
        throw new Error('Association source model not found: "' + source + '"')
      }
      const targetModel = this.models[target]

      if (!targetModel) {
        throw new Error('Association target model not found: "' + target + '"')
      }

      sourceModel[type](targetModel, options)
    },
    $setDatabaseModel (name, fields, options = {}) {
      const schema = {}

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        const schemaItem = {
          type: DataTypes[field.type.toUpperCase()],
          ...field.options
        }

        if (field.defaultValue) {
          if (Object.hasOwn(field.defaultValue, 'dataType')) {
            schemaItem.defaultValue = DataTypes[field.defaultValue.dataType.toUpperCase()]
          } else {
            schemaItem.defaultValue = field.defaultValue
          }
        }

        schema[field.name] = schemaItem
      }

      this.models[name] = this.sequelize.define(name, schema, options)
    },
    $setDatabaseValue (name, {
      source,
      options = {}
    }) {
      const Model = this._getDatabaseModel(name)

      if (!source || !Array.isArray(source)) {
        throw new Error('Source expects an array but got ' + typeof source)
      }

      return Model.bulkCreate(source, options)
    },
    create ({ model, fields, include }) {
      return (request, response) => {
        const options = { updateOnDuplicate: [] }
        const source = []

        for (let i = 0; i < request.body.items.length; i++) {
          const data = request.body.items[i]

          if (include) {
            options.include = []

            for (let i = 0; i < include.length; i++) {
              const item = include[i]
              const includeData = data[item.model + 's']

              if (!includeData) {
                continue
              }

              // add association models
              options.include.push(this._getDatabaseModel(item.model))

              // schema check associated data
              for (let i = 0; i < includeData.length; i++) {
                const data = includeData[i]

                for (let i = 0; i < item.fields.length; i++) {
                  const field = item.fields[i]
                  const cacheData = this.$setDataValue(field.collection, {
                    source: data[field.name],
                    options: {
                      id: data.id
                    }
                  })

                  if (!cacheData.isValid) {
                    throw new Error(cacheData.error.details)
                  }
                }
              }
            }
          }

          for (let i = 0; i < fields.length; i++) {
            const field = fields[i]

            if (!data[field.name]) {
              return response.status(400).send({
                errors: ['Request is missing a required field']
              })
            }

            const cacheData = this.$setDataValue(field.collection, {
              source: data[field.name],
              options: {
                id: data.id
              }
            })

            if (!cacheData.isValid) {
              throw new Error(cacheData.error.details)
            }

            source.push(data)
            options.updateOnDuplicate.push(field.name)
          }
        }

        this.$setDatabaseValue(model, { source, options })
          .then((results) => {
            response.status(201).send({ message: 'OK', results })
          })
          .catch((error) => {
            if (error.constructor.name === 'ValidationError') {
              return response.status(400).send(error)
            }

            response.status(500).send(error)
          })
      }
    },
    deleteById ({ model, collections }) {
      return (request, response) => {
        this.$deleteDatabaseValue(model, {
          where: {
            id: request.query.id
          }
        })
          .then(result => {
            for (let i = 0; i < request.query.id.length; i++) {
              const id = request.query.id[i]

              for (let i = 0; i < collections.length; i++) {
                const data = this.$deleteDataValue(collections[i], id)

                if (!data.deleted) {
                  throw new Error('Could not delete from cache')
                }
              }
            }

            response.status(200).send({
              deleted: result
            })
          })
          .catch(error => response.status(500).send(error))
      }
    },
    getById ({ model, fields, include }) {
      return (request, response) => {
        const query = request.query
        const databaseQuery = []
        const cacheResults = []
        const expand = !!(query.expand && include)

        for (let i = 0; i < query.id.length; i++) {
          const id = query.id[i]
          const cacheItem = { id, cached: true }
          let hasCache = true

          for (let i = 0; i < fields.length; i++) {
            const field = fields[i]
            const data = this.$getDataValue(field.collection, {
              id,
              options: { expand }
            })

            if (data.isEmpty || (expand && data.isExpandEmpty)) {
              databaseQuery.push(id)
              hasCache = false
              break
            } else if (expand) {
              // clean up result
              for (let i = 0; i < include.length; i++) {
                const item = include[i]
                const cacheKey = item.model + 's'

                cacheItem[cacheKey] = []

                const cacheItems = cacheItem[cacheKey]

                for (let i = 0; i < item.fields.length; i++) {
                  const field = item.fields[i]
                  const expandValues = data.expand[field.collection]

                  for (let i = 0; i < expandValues.length; i++) {
                    const expand = expandValues[i]

                    if (!cacheItems[i]) {
                      cacheItems.push({ id: expand.id, [field.name]: expand.item })
                    } else {
                      cacheItems[i][field.name] = expand.item
                    }
                  }
                }
              }
            }

            cacheItem[field.name] = data.item
          }

          if (hasCache) {
            cacheResults.push(cacheItem)
          }
        }

        if (databaseQuery.length) {
          const options = {
            options: {
              where: {
                id: databaseQuery
              }
            }
          }

          if (expand) {
            const models = []

            for (let index = 0; index < include.length; index++) {
              const model = include[index].model

              models.push(this._getDatabaseModel(model))
            }

            options.options.include = models
          }

          this.$getDatabaseValue(model, options)
            .then(results => {
              for (let i = 0; i < results.length; i++) {
                const item = results[i].dataValues

                for (let i = 0; i < fields.length; i++) {
                  const field = fields[i]

                  if (!item[field.name]) {
                    return response.status(400).send({
                      errors: ['Request is missing a required field']
                    })
                  }

                  const data = this.$setDataValue(field.collection, {
                    source: item[field.name],
                    options: {
                      id: item.id
                    }
                  })

                  if (!data.isValid) {
                    throw new Error(data.error.details)
                  }
                }

                if (expand) {
                  for (let i = 0; i < include.length; i++) {
                    const { model, fields } = include[i]
                    const includeData = item[model + 's']

                    if (!includeData) {
                      throw new Error('Could not find data to expand from model: ', model + 's')
                    }

                    for (let i = 0; i < includeData.length; i++) {
                      const data = includeData[i].dataValues

                      for (let i = 0; i < fields.length; i++) {
                        const field = fields[i]
                        const cacheData = this.$setDataValue(field.collection, {
                          source: data[field.name],
                          options: {
                            id: data.id
                          }
                        })

                        if (!cacheData.isValid) {
                          throw new Error(cacheData.error.details)
                        }
                      }
                    }
                  }
                }
              }

              response.status(200).send(cacheResults.concat(results))
            })
            .catch(error => response.status(500).send(error))
        } else {
          response.status(200).send(cacheResults)
        }
      }
    },
    start (sync = {}) {
      return new Promise((resolve, reject) => {
        this.sequelize.authenticate()
          .then(() => {
            if (this.isDev) {
              this.sequelize.sync(sync)
                .then(() => resolve())
                .catch((error) => reject(error))
            } else {
              resolve()
            }
          })
          .catch(error => reject(error))
      })
    },
    /**
     * Get database Model
     * @private
     * @param {string} name - Name of Model
     * @returns {SequelizeModel}
     */
    _getDatabaseModel (name) {
      const Model = this.models[name]

      if (!Model) {
        throw new Error('No Model found')
      }

      return Model
    }
  }
}
