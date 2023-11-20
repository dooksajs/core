import { definePlugin } from '@dooksa/ds-app'

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
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const milliseconds = now.getSeconds()

      this[logType](`${hours}:${minutes}:${seconds}:${milliseconds}`, message, store, code, cause)
    },
    '_log/message' (time, message, store, code) {
      code = code ? ` {blue[${code}]} ` : ' '

      console.log(
        `%c${time}} %cMessage:%c${code}%c${message}`,
        'color:grey;',
        '',
        'color: blue;',
        ''
      )

      if (store) {
        const error = this._error(message, code)

        this.$setDataValue('dsLog/message', error)
      }
    },
    '_log/warn' (time, message, store, code = '400', cause) {
      code = code ? ` {blue[${code}]} ` : ' '

      console.warn(
        `%c${time}} %Warning:%c${code}%c${message}`,
        'color:grey;',
        'color:orange;',
        'color: blue;',
        ''
      )

      if (store) {
        const error = this._error(message, code, cause)

        this.$setDataValue('dsLog/warning', error)
      }
    },
    '_log/error' (time, message, store, code = '500', cause) {
      code = code ? ` {blue[${code}]} ` : ' '

      console.warn(
        `%c${time}} %Error:%c${code}%c${message}`,
        'color:grey;',
        'color:red;',
        'color: blue;',
        ''
      )

      const error = this._error(message, code, cause)

      if (store) {
        this.$setDataValue('dsLog/errors', error)
      }

      throw error
    },
    _error (message, code, cause) {
      return new Error(`${Date.now()} ${message}`, {
        cause: {
          code,
          details: cause
        }
      })
    }
  }
})