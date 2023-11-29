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
    /**
     * Log system errors
     * @param {'info'|'warn'|'error'} type - Type of error
     * @param {Object} param
     * @param {!string} param.message - Message about the log (will be massed to Error constructor if log type is 'error')
     * @param {!string} param.code - Log status code, similar to http status codes but only a length of 2 numbers
     * @param {(string|Error)} [param.cause] - The value that was passed to the Error() constructor in the options.cause argument {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause}
     * @param {boolean} [param.store] - Snapshot the error
     */
    $log (type, { message, cause, code, store }) {
      const logType = '_log/' + type

      if (!this[logType]) {
        throw new Error('No log type: ' + type)
      }

      const now = new Date()
      const hours = this._timeToString(now.getHours())
      const minutes = this._timeToString(now.getMinutes())
      const seconds = this._timeToString(now.getSeconds())
      const milliseconds = now.getMilliseconds().toString().padStart(3, '0')

      this[logType](`${hours}:${minutes}:${seconds}.${milliseconds}`, message, cause, store, code)
    },
    /**
     * Console log message
     * @param {string} time - Current time of log
     * @param {!string} message - Message about the log (will be massed to Error constructor if log type is 'error')
     * @param {*} [cause] - The value that was passed to the Error() constructor in the options.cause argument {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause}
     * @param {boolean} [store] - Snapshot the message
     * @param {!string} [code] - Log status code, similar to http status codes but only a length of 2 numbers
     */
    '_log/info' (time, message, cause, store, code) {
      code = code ? ` [${code}] ` : ' '

      console.log(
        `%c${time} %cInfo:%c${code}%c${message}`,
        'color:grey;',
        '',
        'color: blue;',
        ''
      )

      if (store) {
        const error = this._error(message, code, cause)

        this.$setDataValue('dsLog/message', error)
      }
    },
    /**
     * Console warn message
     * @param {string} time - Current time of log
     * @param {!string} message - Message about the log (will be massed to Error constructor if log type is 'error')
     * @param {boolean} [store] - Snapshot the message
     * @param {!string} [code='40'] - Log status code, similar to http status codes but only a length of 2 numbers
     * @param {*} [cause] - The value that was passed to the Error() constructor in the options.cause argument {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause}
     */
    '_log/warn' (time, message, cause, store, code = '40') {
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
    /**
     * Console error message
     * @param {string} time - Current time of log
     * @param {!string} message - Message about the log (will be massed to Error constructor if log type is 'error')
     * @param {boolean} [store] - Snapshot the message
     * @param {!string} [code='50'] - Log status code, similar to http status codes but only a length of 2 numbers
     * @param {*} [cause] - The value that was passed to the Error() constructor in the options.cause argument {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause}
     */
    '_log/error' (time, message, cause, store, code = '50') {
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
    /**
     *
     * @param {string} message
     * @param {string} code -
     * @param {*} cause - Useful data about the cause of error
     * @returns {Error}
     */
    _error (message, code, cause) {
      let causeValue = {
        code,
        values: cause
      }

      if (cause instanceof Error) {
        causeValue = cause
      }

      return new Error(`${Date.now()} ${message}`, {
        cause: causeValue
      })
    },
    _timeToString (time) {
      return time.toString().padStart(2, '0')
    }
  }
})
