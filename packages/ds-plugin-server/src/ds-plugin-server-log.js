import { definePlugin } from '@dooksa/ds-app'
import { template } from 'chalk-template'
import chalk from 'chalk'

/**
 * Error handler for Dooksa plugins
 * @namespace dsLog
 */
export default definePlugin({
  name: 'dsLog',
  version: 1,
  data: {
    message: {
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    },
    errors: {
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    }
  },
  methods: {
    $log (type, { message, cause, code, store }) {
      const logType = '_log/' + type

      if (!this[logType]) {
        throw new Error('No log type: ' + type)
      }

      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()

      this[logType](`${hours}:${minutes}:${seconds}`, message, store, code, cause)
    },
    '_log/message' (time, message) {
      console.log(template(`{grey ${time}} {white Message:} ${message}`))
    },
    '_log/warn' (time, message, store, code = '400', cause) {
      console.warn(template(`{grey ${time}} {yellow Warning:} ${message}`))

      if (store) {
        const error = this._error(message, code, cause)

        this.$setDataValue('dsLog/errors', error)
      }
    },
    '_log/error' (time, message, store, code = '500', cause) {
      const error = this._error(message, code, cause)

      console.error(template(`{grey ${time}} {red Error:} ${message}`))

      if (store) {
        this.$setDataValue('dsLog/errors', error)
      }

      throw error
    },
    _error (message, code, cause) {
      const plainMessage = chalk.reset(template(`${message}`))

      return new Error(plainMessage, {
        cause: {
          code,
          details: cause
        }
      })
    }
  }
})
