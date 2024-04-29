import createPlugin from '@dooksa/create-plugin'

/**
 * Two or one values to run an operator on
 * @typedef {(string[]|number[])} OperatorValues
 * @example
 * [1, 2]
 * ['hello', 'world]
 * [0]
 */

export default createPlugin('dsOperator', ({ defineActions }) => {
  const operators = {
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
     * @returns {number|string}
     */
    '_operator/++': v => {
      let num = v[0]

      if (v instanceof String) {
        num = parseInt(v[0])
        num++

        return num.toString()
      }

      return ++num
    },
    /**
     * Decrement operator
     * @private
     * @param {number[]} v
     * @returns {number|string}
     */
    '_operator/--': v => {
      let num = v[0]

      if (v instanceof String) {
        num = parseInt(v[0])
        num--

        return num.toString()
      }

      return --num
    },
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
    '_operator/!!': v => Boolean(v[0]),
    /**
     * Check if value is within an string or array
     * @private
     * @param {(string|Array)} v
     * @return {boolean}
     */
    '_operator/~': v => v[0].includes(v[1])
  }

  defineActions({
    compare: {
      schema: {
        name: 'Compare',
        description: 'Compare two or more values',
        params: [
          {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'string'
                },
                {
                  type: 'number'
                }
              ]
            }
          }
        ]
      },
      value (values) {
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
      }
    },
    eval: {
      schema: {
        name: 'Evaluate',
        description: 'Evaluate two values',
        params: [
          {
            type: 'object',
            properties: {
              name: {
                type: 'string'
              },
              values: {
                type: 'array',
                items: {
                  oneOf: [
                    {
                      type: 'string'
                    },
                    {
                      type: 'number'
                    }
                  ]
                }
              }
            }
          }
        ]
      },
      /**
       * Evaluate two values
       * @param {Object} eval - The Object containing the data to evaluate two values
       * @param {string} eval.name - Operator name
       * @param {OperatorValues} eval.values - Contains two values to be evaluated
       */
      value ({ name, values }) {
        if (operators[name]) {
          return operators[name](values)
        } else {
          throw new Error('No operator found: ' + name)
        }
      }
    }
  })
})
