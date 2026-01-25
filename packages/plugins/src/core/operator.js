import { createPlugin } from '@dooksa/create-plugin'

/**
 * Array of values to be processed by an operator
 * @typedef {(string | number | boolean | null)[]} OperatorValues
 * @example
 * // Two values for comparison operators
 * [1, 2]
 * // Two string values
 * ['hello', 'world']
 * // Single value for unary operators
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
 * '!~'|
 * 'isNull'|
 * 'notNull'|
 * 'typeof'} Operator
 */

export const operator = createPlugin('operator', {
  metadata: {
    title: 'Operator',
    description: 'Common operators for Dooksa',
    icon: 'ph:math-operations-fill'
  },
  privateMethods: {
    /**
     * Equality comparison (===)
     * @param {OperatorValues} v - Array with two values to compare
     * @returns {boolean} - True if values are strictly equal
     * @example
     * equality([1, 1]) // true
     * equality(['a', 'b']) // false
     */
    equality (v) {
      return v[0] === v[1]
    },

    /**
     * Inequality comparison (!==)
     * @param {OperatorValues} v - Array with two values to compare
     * @returns {boolean} - True if values are strictly unequal
     * @example
     * inequality([1, 2]) // true
     * inequality([1, 1]) // false
     */
    inequality (v) {
      return v[0] !== v[1]
    },

    /**
     * Greater than comparison (>)
     * @param {OperatorValues} v - Array with two values to compare
     * @returns {boolean} - True if first value is greater than second
     * @example
     * greaterThan([5, 3]) // true
     * greaterThan([2, 5]) // false
     */
    greaterThan (v) {
      return v[0] > v[1]
    },

    /**
     * Greater than or equal comparison (>=)
     * @param {OperatorValues} v - Array with two values to compare
     * @returns {boolean} - True if first value is greater than or equal to second
     * @example
     * greaterThanOrEqual([5, 5]) // true
     * greaterThanOrEqual([3, 5]) // false
     */
    greaterThanOrEqual (v) {
      return v[0] >= v[1]
    },

    /**
     * Less than comparison (<)
     * @param {OperatorValues} v - Array with two values to compare
     * @returns {boolean} - True if first value is less than second
     * @example
     * lessThan([3, 5]) // true
     * lessThan([5, 3]) // false
     */
    lessThan (v) {
      return v[0] < v[1]
    },

    /**
     * Less than or equal comparison (<=)
     * @param {OperatorValues} v - Array with two values to compare
     * @returns {boolean} - True if first value is less than or equal to second
     * @example
     * lessThanOrEqual([5, 5]) // true
     * lessThanOrEqual([5, 3]) // false
     */
    lessThanOrEqual (v) {
      return v[0] <= v[1]
    },

    /**
     * Logical NOT (!)
     * @param {OperatorValues} v - Array with one value to negate
     * @returns {boolean} - Negated boolean value of the input
     * @example
     * logicalNot([true]) // false
     * logicalNot([0]) // true
     */
    logicalNot (v) {
      return !v[0]
    },

    /**
     * Not null check (!= null)
     * @param {OperatorValues} v - Array with one value to check
     * @returns {boolean} - True if value is not null or undefined
     * @example
     * notNull([42]) // true
     * notNull([null]) // false
     */
    notNull (v) {
      return v[0] != null
    },

    /**
     * Is null check (== null)
     * @param {OperatorValues} v - Array with one value to check
     * @returns {boolean} - True if value is null or undefined
     * @example
     * isNull([null]) // true
     * isNull([42]) // false
     */
    isNull (v) {
      return v[0] == null
    },

    /**
     * Remainder operator (%)
     * @param {number[]} v - Array of numbers to compute remainder
     * @returns {number} - Remainder of division
     * @example
     * remainder([10, 3]) // 1
     * remainder([15, 4, 3]) // 0 (15 % 4 % 3)
     */
    remainder (v) {
      let result = /** @type {number} */ (v[0])

      for (let i = 1; i < v.length; i++) {
        result %= /** @type {number} */ (v[i])
      }

      return result
    },

    /**
     * Increment operator (++)
     * @param {number[] | string[]} v - Array with one number or numeric string
     * @returns {number|string} - Incremented value
     * @throws {Error} - If value is not a number or numeric string
     * @example
     * increment([5]) // 6
     * increment(['10']) // '11'
     */
    increment (v) {
      let num = v[0]
      const type = typeof num

      if (type === 'string') {
        // @ts-ignore
        num = parseInt(num)
        num++

        return num.toString()
      } else if (type != 'number') {
        throw new Error('Increment operator expects a number but found "' + type + '"')
      }

      return ++num
    },

    /**
     * Decrement operator (--)
     * @param {number[] | string[]} v - Array with one number or numeric string
     * @returns {number|string} - Decremented value
     * @throws {Error} - If value is not a number or numeric string
     * @example
     * decrement([5]) // 4
     * decrement(['10']) // '9'
     */
    decrement (v) {
      let num = v[0]
      const type = typeof num

      if (type === 'string') {
        // @ts-ignore
        num = parseInt(num)
        num--

        return num.toString()
      } else if (type != 'number') {
        throw new Error('Decrement operator expects a number but found "' + type + '"')
      }

      return --num
    },

    /**
     * Negation/subtraction operator (-)
     * @param {number[]} v - Array of numbers to subtract
     * @returns {number} - Result of subtraction
     * @example
     * negation([10, 3]) // 7
     * negation([20, 5, 3]) // 12 (20 - 5 - 3)
     */
    negation (v) {
      let result = /** @type {number} */ (v[0])

      for (let i = 1; i < v.length; i++) {
        result -= /** @type {number} */ (v[i])
      }

      return result
    },

    /**
     * Addition/concatenation operator (+)
     * @param {number[] | string[]} v - Array of numbers or strings to add/concatenate
     * @returns {number | string} - Sum of numbers or concatenated strings
     * @example
     * addition([5, 3]) // 8
     * addition(['hello', ' ', 'world']) // 'hello world'
     */
    addition (v) {
      let result = /** @type {any} */ (v[0])

      for (let i = 1; i < v.length; i++) {
        result += /** @type {any} */ (v[i])
      }

      return result
    },

    /**
     * Multiplication operator (*)
     * @param {number[]} v - Array of numbers to multiply
     * @returns {number} - Product of numbers
     * @example
     * multiplication([2, 3]) // 6
     * multiplication([2, 3, 4]) // 24
     */
    multiplication (v) {
      let result = /** @type {number} */ (v[0])

      for (let i = 1; i < v.length; i++) {
        result *= /** @type {number} */ (v[i])
      }

      return result
    },

    /**
     * Exponentiation operator (**)
     * @param {number[]} v - Array with base and exponent
     * @returns {number} - Base raised to the power of exponent
     * @example
     * exponentiation([2, 3]) // 8
     * exponentiation([5, 2]) // 25
     */
    exponentiation (v) {
      return v[0] ** v[1]
    },

    /**
     * Boolean conversion (!!)
     * @param {OperatorValues} v - Array with one value to convert to boolean
     * @returns {boolean} - Boolean representation of the value
     * @example
     * isBoolean([1]) // true
     * isBoolean([0]) // false
     * isBoolean(['']) // false
     */
    isBoolean (v) {
      return Boolean(v[0])
    },

    /**
     * Includes check (contains)
     * @param {string|Array} v - Array where v[0] is the container and v[1] is the search value
     * @returns {boolean} - True if v[1] is included in v[0]
     * @example
     * isLike(['hello world', 'world']) // true
     * isLike([[1, 2, 3], 2]) // true
     * isLike(['hello', 'x']) // false
     */
    isLike (v) {
      return v[0].includes(v[1])
    },

    /**
     * Does not include check (does not contain)
     * @param {string|Array} v - Array where v[0] is the container and v[1] is the search value
     * @returns {boolean} - True if v[1] is NOT included in v[0]
     * @example
     * isNotLike(['hello world', 'xyz']) // true
     * isNotLike([[1, 2, 3], 4]) // true
     * isNotLike(['hello', 'ell']) // false
     */
    isNotLike (v) {
      return !v[0].includes(v[1])
    },

    /**
     * Type detection
     * @param {*[]} v - Array with one value to get type of
     * @returns {string} - Type of the value ('array' for arrays, otherwise typeof result)
     * @example
     * typeOf([42]) // 'number'
     * typeOf(['hello']) // 'string'
     * typeOf([[]]) // 'array'
     * typeOf([null]) // 'object'
     */
    typeOf (v) {
      const value = v[0]
      const type = typeof value

      // return array
      if (type === 'object' && Array.isArray(value)) {
        return 'array'
      }

      return type
    }
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
       * Performs logical comparison between multiple value pairs using AND (&&) or OR (||) operators
       * @param {Object[]} values - Array of comparison objects
       * @param {*} values[].value_1 - First value to compare
       * @param {*} values[].value_2 - Second value to compare
       * @param {'&&'|'||'} values[].op - Logical operator to apply ('&&' for AND, '||' for OR)
       * @returns {boolean} - Result of the logical comparison
       * @example
       * // AND comparison
       * operatorCompare([
       *   { value_1: true, value_2: true, op: '&&' }
       * ]) // true
       *
       * // OR comparison
       * operatorCompare([
       *   { value_1: false, value_2: true, op: '||' }
       * ]) // true
       *
       * // Multiple comparisons
       * operatorCompare([
       *   { value_1: 5, value_2: 3, op: '&&' },
       *   { value_1: 2, value_2: 4, op: '||' }
       * ]) // true (5 > 3 AND 2 < 4)
       */
      method (values) {
        let OR = false
        let AND = true
        let hasAnd = false

        for (let i = 0; i < values.length; i++) {
          const item = values[i]

          if (item.op === '&&' && AND) {
            AND = item.value_1 && item.value_2
            hasAnd = true
          }

          if (item.op === '||') {
            if (item.value_1 || item.value_2) {
              OR = true
            }
          }
        }

        if (OR) {
          return true
        }

        if (hasAnd && AND) {
          return true
        }

        return false
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
       * Evaluate values using a specified operator
       * @param {Object} eval - Evaluation parameters
       * @param {Operator} eval.name - Name of the operator to apply
       * @param {*[]} eval.values - Array of values to evaluate (typically 1-2 values)
       * @returns {*} - Result of the operator evaluation
       * @throws {Error} - If the specified operator is not found
       * @example
       * // Equality comparison
       * operatorEval({ name: '==', values: [1, 1] }) // true
       *
       * // Addition
       * operatorEval({ name: '+', values: [5, 3] }) // 8
       *
       * // Type detection
       * operatorEval({ name: 'typeof', values: [42] }) // 'number'
       *
       * // Logical NOT
       * operatorEval({ name: '!', values: [false] }) // true
       */
      method ({ name, values }) {
        switch (name) {
          case '==': return this.equality(values)
          case '!=': return this.inequality(values)
          case '>': return this.greaterThan(values)
          case '>=': return this.greaterThanOrEqual(values)
          case '<': return this.lessThan(values)
          case '<=': return this.lessThanOrEqual(values)
          case '!': return this.logicalNot(values)
          case '%': return this.remainder(values)
          case '++': return this.increment(values)
          case '--': return this.decrement(values)
          case '-': return this.negation(values)
          case '+': return this.addition(values)
          case '*': return this.multiplication(values)
          case '**': return this.exponentiation(values)
          case '!!': return this.isBoolean(values)
          case '~': return this.isLike(values)
          case '!~': return this.isNotLike(values)
          case 'isNull': return this.isNull(values)
          case 'notNull': return this.notNull(values)
          case 'typeof': return this.typeOf(values)
          default: throw new Error('No operator found: ' + name)
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
