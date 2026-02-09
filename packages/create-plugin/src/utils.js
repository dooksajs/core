import { isObject } from '@dooksa/utils'

/**
 * @param {import('#types').SchemaType} type - The data type to create a value for
 */
export function dataValue (type) {
  let value

  switch (type) {
    case 'collection':
      value = {}
      break
    case 'object':
      value = {}
      break
    case 'array':
      value = []
      break
    case 'string':
      value = ''
      break
    case 'number':
      value = 0
      break
    case 'boolean':
      value = true
      break
    default:
      throw new Error('DooksaError: Unexpected data schema "' + type + '"')
  }

  return value
}

/**
 * @param {any} target - The object/function to bind
 * @param {any} context - The 'this' context to apply
 * @param {WeakMap} seen - Internal tracker for circular references
 */
export function bindContext (target, context, seen = new WeakMap()) {
  // Handle Functions: Bind and return
  if (typeof target === 'function') {
    return target.bind(context)
  }

  // Handle Primitives and "Special" Objects (Date, RegExp, etc.)
  if (
    !target
    || typeof target !== 'object'
    || (
      !isObject(target)
      && !Array.isArray(target)
    )
  ) {
    return target
  }

  // Circular Reference Check: If we've seen this object, return the bound version
  if (seen.has(target)) {
    return seen.get(target)
  }

  // Prepare the container (Array or Null-Prototype Object)
  const isArray = Array.isArray(target)
  const boundClone = isArray ? [] : Object.create(null)

  // Store the mapping BEFORE recursing to catch deep circularity
  seen.set(target, boundClone)

  // Recurse through keys
  const keys = isArray ? target.keys() : Object.keys(target)

  for (const key of keys) {
    const value = target[key]
    // Recursively bind children
    boundClone[key] = bindContext(value, context, seen)
  }

  return boundClone
}
