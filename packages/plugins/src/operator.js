import createPlugin from '@dooksa/create-plugin'

/**
 * Two or one values to run an operator on
 * @typedef {(string[]|number[])} OperatorValues
 * @example
 * [1, 2]
 * ['hello', 'world]
 * [0]
 */

const operators = {
  /**
   * Equality
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '==': v => v[0] === v[1],
  /**
   * Inequality
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '!=': v => v[0] !== v[1],
  /**
   * Greater than
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '>': v => v[0] > v[1],
  /**
   * Greater than or equal operator
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '>=': v => v[0] >= v[1],
  /**
   * Less than
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '<': v => v[0] < v[1],
  /**
   * Less than or equal operator
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '<=': v => v[0] <= v[1],
  /**
   * Logical NOT
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '!': v => !v[0],
  /**
   * Remainder operator
   * @private
   * @param {number[]} v
   * @returns {number}
   */
  '%': v => v[0] % v[1],
  /**
   * Increment operator
   * @private
   * @param {number[]} v
   * @returns {number|string}
   */
  '++': v => {
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
  '--': v => {
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
  '-': v => v[0] - v[1],
  /**
   * Plus operator
   * @private
   * @param {number[]} v
   * @returns {number}
   */
  '+': v => v[0] + v[1],
  /**
   * Multiplication operator
   * @private
   * @param {number[]} v
   * @returns {number}
   */
  '*': v => v[0] * v[1],
  /**
   * Exponentiation operator
   * @private
   * @param {number[]} v
   * @returns {number}
   */
  '**': v => v[0] ** v[1],
  /**
   * Boolean value
   * @private
   * @param {OperatorValues} v
   * @returns {boolean}
   */
  '!!': v => Boolean(v[0]),
  /**
   * Check if value is within an string or array
   * @private
   * @param {(string|Array)} v
   * @return {boolean}
   */
  '~': v => v[0].includes(v[1])
}

const operator = createPlugin('operator', {
  metadata: {
    title: 'Operator',
    description: 'Common operators for Dooksa',
    icon: 'ph:math-operations-fill'
  },
  actions: {
    compare: {
      metadata: {
        title: 'Compare',
        description: 'Compare two or more values',
        icon: 'mdi:equal-box'
      },
      parameters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            value_1: {
              type: 'primitives',
              component: {
                group: 'Compare',
                title: 'This',
                id: 'action-parma-value'
              },
              required: true
            },
            value_2: {
              type: 'primitives',
              component: {
                group: 'Compare',
                title: 'That',
                id: 'action-parma-value'
              },
              required: true
            },
            op: {
              type: 'string',
              component: {
                title: 'Operation',
                group: 'Compare',
                id: 'action-param-operator-compare-op'
              },
              required: true
            }
          }
        }
      },
      /**
       * Compare two or more values
       * @param {Object[]} values - Contains two values or more values which are compared
       * @param {*} values[].value_1 - Contains two values or more values which are compared
       * @param {*} values[].value_2 - Contains two values or more values which are compared
       * @param {'&&'|'||'} values[].op - Contains two values or more values which are compared
       * @example
       * const andValues = ['1', '&&', 1]
       */
      method (values) {
        let result = false

        for (let i = 0; i < values.length; i++) {
          const item = values[i]

          if (item.op === '&&') {
            if ((item.value_1 && item.value_2)) {
              result = true
            } else {
              break
            }
          }

          if (item.op === '||') {
            if ((item.value_1 || item.value_2)) {
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
      metadata: {
        title: 'Evaluate two values',
        description: 'Evaluate two values using an operator',
        icon: 'ph:math-operations-fill'
      },
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            component: {
              title: 'Operator',
              id: 'action-param-operator-eval-name'
            },
            required: true
          },
          values: {
            type: 'array',
            items: {
              type: 'string',
              component: {
                title: 'Values',
                id: 'action-param-operator-eval-values'
              },
              required: true
            },
            maxItems: 2,
            required: true
          }
        }
      },
      /**
       * Evaluate two values
       * @param {Object} eval - The Object containing the data to evaluate two values
       * @param {string} eval.name - Operator name
       * @param {OperatorValues} eval.values - Contains two values to be evaluated
       */
      method ({ name, values }) {
        if (operators[name]) {
          return operators[name](values)
        } else {
          throw new Error('No operator found: ' + name)
        }
      }
    }
  }
})

const operatorEval = operator.actions.eval
const operatorCompare = operator.actions.compare

export {
  operator,
  operatorEval,
  operatorCompare
}

export default operator
