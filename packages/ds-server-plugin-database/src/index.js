import { Sequelize, DataTypes, Op } from 'sequelize'

/**
 * @namespace dssDatabase
 */
export default {
  name: 'dssDatabase',
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
   * Setup dssDatabase
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
  /** @lends dssDatabase */
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
