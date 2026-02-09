/**
 * Checks if the code is running in a server environment
 * @returns {boolean} True if running in a server environment
 */
export default function isEnvServer () {
  return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined')
}
