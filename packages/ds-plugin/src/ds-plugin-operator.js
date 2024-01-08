import { definePlugin } from '@dooksa/ds-scripts'

/**
 * Two or one values to run an operator on
 * @typedef {(string[]|number[])} OperatorValues
 * @example
 * [1, 2]
 * ['hello', 'world]
 * [0]
 */

export default definePlugin({
  name: 'dsOperator',
  version: 1,
  methods: {
    iterate ({ item, dsActionId }) {
      for (const key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
          const value = item[key]

          this.$method('dsAction/dispatch', { id: dsActionId, payload: { key, value } })
        }
      }
    },
    /**
     * Evaluate two values
     * @param {Object} eval - The Object containing the data to evaluate two values
     * @param {string} eval.name - Operator name
     * @param {OperatorValues} eval.values - Contains two values to be evaluated
     */
    eval ({ name, values }) {
      const operator = '_operator/' + name

      if (this[operator]) {
        return this[operator](values)
      } else {
        this.$log('error', { message: 'Unexpected operator name: "' + name + '"' })
      }
    },
    /**
     * Compare two or more values
     * @param {*[]} values - Contains two values or more values which are compared
     * @example
     * const andValues = ['1', '&&', 1]
     */
    compare (values) {
      let result = false

      for (let i = 0; i < values.length; i++) {
        const value = values[i]

        if (value === '&&') {
          if ((values[i - 1] && values[i + 1])) {
            result = true
          } else {
            break
          }
        }

        if (value === '||') {
          if ((values[i - 1] || values[i + 1])) {
            result = true
          } else {
            break
          }
        }
      }

      return result
    },
    /**
     * Equality
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/==': v => v[0] === v[1],
    /**
     * Inequality
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/!=': v => v[0] !== v[1],
    /**
     * Greater than
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/>': v => v[0] > v[1],
    /**
     * Greater than or equal operator
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/>=': v => v[0] >= v[1],
    /**
     * Less than
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/<': v => v[0] < v[1],
    /**
     * Less than or equal operator
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/<=': v => v[0] <= v[1],
    /**
     * Logical NOT
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/!': v => !v[0],
    /**
     * Remainder operator
     * @private
     * @param {number[]} v
     * @returns {number}
     */
    '_operator/%': v => v[0] % v[1],
    /**
     * Increment operator
     * @private
     * @param {number[]} v
     * @returns {number}
     */
    '_operator/++': v => ++v[0],
    /**
     * Decrement operator
     * @private
     * @param {number[]} v
     * @returns {number}
     */
    '_operator/--': v => --v[0],
    /**
     * Negation operator
     * @private
     * @param {number[]} v
     * @returns {number}
     */
    '_operator/-': v => v[0] - v[1],
    /**
     * Plus operator
     * @private
     * @param {number[]} v
     * @returns {number}
     */
    '_operator/+': v => v[0] + v[1],
    /**
     * Multiplication operator
     * @private
     * @param {number[]} v
     * @returns {number}
     */
    '_operator/*': v => v[0] * v[1],
    /**
     * Exponentiation operator
     * @private
     * @param {number[]} v
     * @returns {number}
     */
    '_operator/**': v => v[0] ** v[1],
    /**
     * Boolean value
     * @private
     * @param {OperatorValues} v
     * @returns {boolean}
     */
    '_operator/boolean': v => Boolean(v[0]),
    /**
     * Check if value is within an string or array
     * @private
     * @param {(string|Array)} v
     * @return {boolean}
     */
    '_operator/includes': v => v[0].includes(v[1])
  }
})
