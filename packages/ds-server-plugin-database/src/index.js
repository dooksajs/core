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
      const Model = this.sequelize.define(name, schema, options)

      Model.beforeBulkCreate((docs, options) => {
        options.ignoreDuplicates = true
      })

      this.models[name] = Model
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
        const options = { ignoreDuplicates: true }
        const source = []

        for (let i = 0; i < request.body.length; i++) {
          const data = request.body[i]

          if (include) {
            options.include = this._setIncludeDataValues(include, data)
          }

          for (let i = 0; i < fields.length; i++) {
            const field = fields[i]
            const fieldData = data[field.name]

            if (!fieldData) {
              return response.status(400).send({
                errors: ['Request is missing a required field']
              })
            }

            const cacheData = this.$setDataValue(field.collection, {
              source: fieldData,
              options: {
                id: data.id
              }
            })

            if (!cacheData.isValid) {
              throw new Error(cacheData.error.details)
            }

            source.push(data)
          }
        }

        this.$setDatabaseValue(model, { source, options })
          .then(() => {
            response.status(201).send({ message: 'OK' })
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
        const expand = !!(query.expand && include)
        const cacheResults = []
        let databaseQuery = false
        let hasCache = true

        if (!query.ignoreCache) {
          for (let i = 0; i < query.id.length; i++) {
            const id = query.id[i]
            const cacheItem = { cached: true, item: [] }

            for (let i = 0; i < fields.length; i++) {
              const field = fields[i]
              const data = this.$getDataValue(field.collection, {
                id,
                options: { expand }
              })

              if (data.isEmpty || (expand && data.isExpandEmpty)) {
                databaseQuery = true
                hasCache = false
                break
              }

              cacheItem.item.push({
                id,
                collection: field.collection,
                item: data.item,
                expand: data.expand || false
              })
            }

            if (!hasCache) {
              break
            }

            cacheResults.push(cacheItem)
          }
        } else {
          databaseQuery = true
        }

        if (!databaseQuery) {
          return response.status(200).send(cacheResults)
        }

        const options = {
          options: {
            where: {
              id: query.id
            }
          }
        }

        if (expand) {
          // prepare include options
          options.options.include = []

          this._whereInclude(include, options.options.include)
        }

        this.$getDatabaseValue(model, options)
          .then(results => {
            const dsResults = []

            for (let i = 0; i < results.length; i++) {
              const item = results[i].dataValues
              const dsItem = { cache: false, items: [] }

              dsResults.push(dsItem)

              if (expand) {
                this._setIncludeDataValues(include, item)
              }

              for (let i = 0; i < fields.length; i++) {
                const field = fields[i]

                if (!item[field.name]) {
                  return response.status(400).send({
                    errors: ['Request is missing a required field']
                  })
                }

                const setData = this.$setDataValue(field.collection, {
                  source: item[field.name],
                  options: {
                    id: item.id
                  }
                })

                if (!setData.isValid) {
                  throw new Error(setData.error.details)
                }

                const getData = this.$getDataValue(field.collection, {
                  id: item.id,
                  options: { expand }
                })

                dsItem.items.push({
                  id: item.id,
                  collection: field.collection,
                  item: getData.item,
                  expand: getData.expand || false
                })
              }
            }

            response.status(200).send(dsResults)
          })
          .catch(error => response.status(500).send(error))
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
