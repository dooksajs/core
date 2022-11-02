export const camelToKebabCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

export const kebabToCamelCase = str => str.replace(/-./g, x => x[1].toUpperCase())
