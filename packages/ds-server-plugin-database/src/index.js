import { Sequelize, DataTypes, Op } from 'sequelize'

function BulkData () {
  this.isValid = true
  this.value = []
}

BulkData.prototype.setError = function (message) {
  this.isValid = false
  this.error = message
}

BulkData.prototype.id = (string) => {
  const id = string.split('_')

  return {
    default: '_' + id[1] + '_',
    prefix: id[0],
    suffix: id[2]
  }
}

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
    storage,
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
    $getModel (name) {
      return this.model[name]
    },
    association (item) {
      if (!this.associationTypes[item.type]) {
        throw new Error('No association type found')
      }

      const sourceModel = this.models[item.source]

      if (!sourceModel) {
        throw new Error('Association source model not found: "' + item.source + '"')
      }
      const targetModel = this.models[item.target]

      if (!targetModel) {
        throw new Error('Association target model not found: "' + item.target + '"')
      }

      sourceModel[item.type](targetModel, item.options || {})
    },
    bulkData () {
      return new BulkData()
    },
    model ({ name, fields }) {
      const options = {}

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        const option = {
          type: DataTypes[field.type.toUpperCase()],
          ...field.options
        }

        if (field.defaultValue) {
          if (Object.hasOwn(field.defaultValue, 'dataType')) {
            option.defaultValue = DataTypes[field.defaultValue.dataType.toUpperCase()]
          } else {
            option.defaultValue = field.defaultValue
          }
        }

        options[field.name] = option
      }
      const Model = this.sequelize.define(name, options)

      this.models[name] = Model
    },
    start () {
      return new Promise((resolve, reject) => {
        this.sequelize.authenticate()
          .then(() => {
            if (this.isDev) {
              this.sequelize.sync({ force: true })
                .then(() => resolve())
                .catch((error) => reject(error))
            } else {
              resolve()
            }
          })
          .catch(error => reject(error))
      })
    }
  }
}
