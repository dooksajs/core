import createPlugin from '@dooksa/create-plugin'

/**
 * Two or one values to run an operator on
 * @typedef {(string | number | boolean | null)[]} OperatorValues
 * @example
 * [1, 2]
 * ['hello', 'world]
 * [0]
 */

/**
 * @typedef {'=='|
 * '!='|
 * '>'|
 * '>='|
 * '<'|
 * '<='|
 * '!'|
 * '%'|
 * '++'|
 * '--'|
 * '-'|
 * '+'|
 * '*'|
 * '**'|
 * '!!'|
 * '~'|
 * 'isNull'|
 * 'notNull'|
 * 'typeof'} Operator
 */

/**
 * Equality
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function equality (v) {
  return v[0] === v[1]
}
/**
 * Inequality
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function inequality (v) {
  return v[0] != v[1]
}
/**
 * Greater than
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function greaterThan (v) {
  return v[0] > v[1]
}
/**
 * Greater than or equal operator
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function greaterThanOrEqual (v) {
  return v[0] >= v[1]
}
/**
 * Less than
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function lessThan (v) {
  return v[0] < v[1]
}
/**
 * Less than or equal operator
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function lessThanOrEqual (v) {
  return v[0] <= v[1]
}
/**
 * Logical NOT
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function logicalNot (v) {
  return !v[0]
}
/**
 * not Null
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function notNull (v) {
  return v[0] != null
}
/**
 * is Null
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function isNull (v) {
  return v[0] == null
}
/**
 * Remainder operator
 * @private
 * @param {number[]} v
 * @returns {number}
 */
function remainder (v) {
  let result = 0

  for (let i = 0; i < v.length; i++) {
    result %= v[i]
  }

  return result
}
/**
 * Increment operator
 * @private
 * @param {number[]} v
 * @returns {number|string}
 */
function increment (v) {
  let num = v[0]
  const type = typeof num

  if (type === 'string') {
    // @ts-ignore
    num = parseInt(num)
    num++

    return num.toString()
  } else if (type != 'number') {
    throw new Error('DooksaError: Increment operator expects a number but found "' + type + '"')
  }

  return ++num
}
/**
 * Decrement operator
 * @private
 * @param {number[]} v
 * @returns {number|string}
 */
function decrement (v) {
  let num = v[0]
  const type = typeof num

  if (type === 'string') {
    // @ts-ignore
    num = parseInt(num)
    num--

    return num.toString()
  } else if (type != 'number') {
    throw new Error('DooksaError: Decrement operator expects a number but found "' + type + '"')
  }

  return --num
}
/**
 * Negation operator
 * @private
 * @param {number[]} v
 * @returns {number}
 */
function negation (v) {
  let result = 0

  for (let i = 0; i < v.length; i++) {
    result -= v[i]
  }

  return result
}
/**
 * Plus operator
 * @private
 * @param {number[] & string[]} v
 * @returns {number | string}
 */
function addition (v) {
  /** @type {string | number} */
  let result = ''

  if (typeof v[0] === 'number') {
    result = 0
  }

  for (let i = 0; i < v.length; i++) {
    result += v[i]
  }

  return result
}
/**
 * Multiplication operator
 * @private
 * @param {number[]} v
 * @returns {number}
 */
function multiplication (v) {
  let result = 0

  for (let i = 0; i < v.length; i++) {
    result *= v[i]
  }

  return result
}
/**
 * Exponentiation operator
 * @private
 * @param {number[]} v
 * @returns {number}
 */
function exponentiation (v) {
  return v[0] ** v[1]
}
/**
 * Boolean value
 * @private
 * @param {OperatorValues} v
 * @returns {boolean}
 */
function isBoolean (v) {
  return Boolean(v[0])
}
/**
 * Check if value is within an string or array
 * @private
 * @param {(string|Array)} v
 * @return {boolean}
 */
function isLike (v) {
  return v[0].includes(v[1])
}
/**
 * Check if value is within an string or array
 * @private
 * @param {*[]} v
 * @return {string}
 */
function typeOf (v) {
  const value = v[0]
  const type = typeof value

  // return array
  if (type === 'object' && Array.isArray(value)) {
    return 'array'
  }

  return type
}

const operators = Object.create(null)
operators['=='] = equality
operators['!='] = inequality
operators['>'] = greaterThan
operators['>='] = greaterThanOrEqual
operators['<'] = lessThan
operators['<='] = lessThanOrEqual
operators['!'] = logicalNot
operators['%'] = remainder
operators['++'] = increment
operators['--'] = decrement
operators['-'] = negation
operators['+'] = addition
operators['*'] = multiplication
operators['**'] = exponentiation
operators['!!'] = isBoolean
operators['~'] = isLike
operators['isNull'] = isNull
operators['notNull'] = notNull
operators['typeof'] = typeOf

export const operator = createPlugin('operator', {
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
              required: true
            },
            value_2: {
              type: 'primitives',
              required: true
            },
            op: {
              type: 'string',
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
            required: true
          },
          values: {
            type: 'array',
            items: {
              type: 'string',
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
       * @param {Operator} eval.name - Operator name
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

export const {
  operatorEval,
  operatorCompare
} = operator

export default operator
