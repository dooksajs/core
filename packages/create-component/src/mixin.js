/**
 * @import {ComponentMixinMetadata, ComponentDataValues, Infix, InfixItem} from './types.js'
 */

/**
 * @param {InfixItem[]} infixes
 * @param {Object.<string, string>} options
 */
function classNameInfix (infixes, options) {
  let className = ''

  for (let i = 0; i < infixes.length; i++) {
    const infix = infixes[i]
    const name = options[infix.name]

    // check if option for this affix exists
    if (!name) {
      continue
    }

    const separator = infix.separator

    if (infix.values) {
      const value = infix.values[name]

      if (value) {
        className += separator + value
      }
    } else {
      className += separator + name
    }
  }

  return className
}

/**
 * @param {Infix} param
 */
export function computedInfixValue ({
  className,
  infixes,
  separator = '-',
  suffix
}) {
  // add affix default separator
  for (let i = 0; i < infixes.length; i++) {
    const infix = infixes[i]

    // set default separator
    if (infix.separator == null) {
      infix.separator = separator
    }
  }

  return function (options = []) {
    let classNames = ''
    let firstChar = className

    for (let i = 0; i < options.length; i++) {
      const option = options[i]

      classNames += firstChar + classNameInfix(infixes, option)

      // add
      if (suffix) {
        classNames += separator + suffix
      }

      firstChar = ' ' + className
    }

    return classNames
  }
}

/**
* @param {Object} mixin
* @param {ComponentMixinMetadata} mixin.metadata
* @param {ComponentDataValues} mixin.data
*/
export default function createMixin (mixin) {
  if (mixin.data && mixin.data.options) {
    const options =mixin.data.options
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const option = options[key]

        // set infix values to computed value
        if (option.infixValues) {
          option.computedValue = computedInfixValue(option.infixValues)
        }
      }
    }
  }

  return mixin
}
