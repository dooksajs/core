export default function isEnvServer () {
  return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined')
}
