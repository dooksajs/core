import { definePlugin } from '@dooksa/utils'

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
      const milliseconds = now.getMilliseconds().toString().padStart(3, 0)

      this[logType](`${hours}:${minutes}:${seconds}.${milliseconds}`, message, store, code, cause)
    },
    '_log/info' (time, message, store, code) {
      code = code ? ` [${code}] ` : ' '

      console.log(
        `%c${time} %cInfo:%c${code}%c${message}`,
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
      code = code ? ` [${code}] ` : ' '

      console.warn(
        `%c${time} %cWarning:%c${code}%c${message}`,
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
      code = code ? ` [${code}] ` : ' '

      console.error(
        `%c${time} %cError:%c${code}%c${message}`,
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
    },
    _timeToString (time) {
      return time.toString().padStart(2, 0)
    }
  }
})
