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
    info: {
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    },
    warning: {
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
      const hours = this._timeToString(now.getHours())
      const minutes = this._timeToString(now.getMinutes())
      const seconds = this._timeToString(now.getSeconds())
      const milliseconds = this._timeToString(now.getMilliseconds())

      this[logType](`${hours}:${minutes}:${seconds}.${milliseconds}`, message, store, code, cause)
    },
    '_log/info' (time, message, store, code) {
      code = code ? ` {blue[${code}]} ` : ' '

      console.log(template(`{grey ${time}} {white Info:}${code}${message}`))

      if (store) {
        const error = this._error(message, code)

        this.$setDataValue('dsLog/info', error)
      }
    },
    '_log/warn' (time, message, store, code = '400', cause) {
      code = code ? ` {blue[${code}]} ` : ' '

      console.warn(template(`{grey ${time}} {yellow Warning:} ${code} ${message}`))

      if (store) {
        const error = this._error(message, code, cause)

        this.$setDataValue('dsLog/warning', error)
      }
    },
    '_log/error' (time, message, store, code = '500', cause) {
      code = code ? ` {blue[${code}]} ` : ' '

      console.error(template(`{grey ${time}} {red Error:}${code}${message}`))

      const error = this._error(message, code, cause)

      if (store) {
        this.$setDataValue('dsLog/errors', error)
      }

      throw error
    },
    _error (message, code, cause) {
      const plainMessage = chalk.reset(template(`${message}`))

      return new Error(`${Date.now()} ${plainMessage}`, {
        cause: {
          code,
          details: cause
        }
      })
    },
    _timeToString (time) {
      return time.toString().padStart(2, 0)
    }
  }
})
