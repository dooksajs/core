export default function isServer () {
  return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined')
}
