
export default (value) => {
  const MOD_ADLER = 65521
  let a = 1
  let b = 0
  value = new Uint8Array(value)

  for (let i = 0; i < value.length; i++) {
    a += value[i]
    b += a
  }

  a %= MOD_ADLER
  b %= MOD_ADLER

  return hex(((b << 16) | a) >>> 0, 8)
}

/**
 * Translates a character into an ordinal.
 *
 * @param {char} c
 * @returns {number}
 *
 * @example
 * // returns 97
 * ord('a');
 */
const ord = (c) => {
  // Detect astral symbols
  // Thanks to @mathiasbynens for this solution
  // https://mathiasbynens.be/notes/javascript-unicode
  if (c.length === 2) {
    const high = c.charCodeAt(0)
    const low = c.charCodeAt(1)

    if (high >= 0xd800 && high < 0xdc00 &&
        low >= 0xdc00 && low < 0xe000) {
      return (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000
    }
  }

  return c.charCodeAt(0)
}

/**
 * Converts a character or number to its hex representation.
 *
 * @param {char|number} c
 * @param {number} [length=2] - The width of the resulting hex number.
 * @returns {string}
 *
 * @example
 * // returns "6e"
 * hex("n")
 *
 * // returns "6e"
 * hex(110)
 */
const hex = (c, length = 2) => {
  c = typeof c === 'string' ? ord(c) : c
  return c.toString(16).padStart(length, '0')
}
