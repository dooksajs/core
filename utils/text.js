export const camelToKebabCase = str => {
  // lowercase first letter
  str = str.charAt(0).toLowerCase() + str.substring(1)

  // replace capitalised letters with dashes
  str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

  return str
}

export const kebabToCamelCase = str => str.replace(/-./g, x => x[1].toUpperCase())
