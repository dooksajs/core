// import basePlugins from './basePlugins'

export default (name, version) => {
  if (basePlugins[name]) {
    if (version && basePlugins[name].items[version]) {
      return basePlugins[name].items[version].current
    } else {
      return basePlugins[name]
    }
  }
}
