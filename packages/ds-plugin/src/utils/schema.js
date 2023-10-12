export default {
  entry (context, item, name) {
    const props = ['items', 'properties', 'patternProperties', 'type', 'name']
    const idProps = ['defaultId', 'suffixId', 'prefixId']
    const entry = { type: item.type }
    const options = {}
    let additionalProperties
    const id = {}

    let hasOptions = false
    let hasId = false

    if (name) {
      entry.name = name
    }

    for (const key in item) {
      if (Object.hasOwn(item, key)) {
        let value = item[key]

        // prepare additionalProperties
        if (key === 'properties') {
          additionalProperties = Object.keys(value)
        }

        // collect options
        if (idProps.includes(key)) {
          const idKey = key.substring(-1, key.length - 2)

          // add plugin context to function
          if (typeof value === 'function') {
            value = value.bind(context)
          }

          id[idKey] = value
          hasId = true
        } else if (!props.includes(key)) {
          options[key] = value
          hasOptions = true
        }
      }
    }

    if (hasOptions) {
      // add allowed properties
      if (options.additionalProperties === false) {
        options.additionalProperties = additionalProperties
      }

      if (typeof options.default === 'function') {
        options.default = options.default.bind(context)
      }

      entry.options = options
    }

    if (hasId) {
      entry.id = id
    }

    return entry
  },
  create (context, items) {
    const result = {
      entry: this.entry(context, items)
    }

    if (items.properties || items.patternProperties) {
      result.properties = []
      result.patternProperties = []
      result.entryProperties = items.properties
      result.entryPatternProperties = items.patternProperties

      for (const key in items.patternProperties) {
        if (Object.hasOwn(items.patternProperties, key)) {
          const property = items.patternProperties[key]
          const hasProperties = this.hasProperties(property)

          if (hasProperties) {
            result.patternProperties.push({
              name: key,
              type: property.type
            })
          } else {
            const entry = this.entry(context, property, key)

            result.patternProperties.push(entry)
          }
        }
      }

      for (const key in items.properties) {
        if (Object.hasOwn(items.properties, key)) {
          const property = items.properties[key]
          const hasProperties = this.hasProperties(property)

          if (hasProperties) {
            result.properties.push({
              name: key,
              type: property.type
            })
          } else {
            const entry = this.entry(context, property, key)

            result.properties.push(entry)
          }
        }
      }
    } else if (items.items) {
      result.items = items.items
    }

    return result
  },
  hasProperties (entry) {
    return !!(entry.items || entry.properties || entry.patternProperties)
  },
  processProperties (context, id, properties = [], options, entries) {
    const entryProperties = []

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]
      const name = property.name

      if (Array.isArray(options?.required) && options.required.includes(name)) {
        property.required = true
      }

      const hasProps = this.hasProperties(property)

      if (hasProps) {
        if (property.type === 'object') {
          const item = this.create(context, property)

          this.object(context, id + '/' + name, item.entry, item.properties, item.patternProperties, item.entry.options, entries)
        } else {
          this.process(context, id + '/' + name, property, entries, true)
        }
      }

      entryProperties.push(property)
    }

    return entryProperties
  },
  object (context, id, entry, properties, patternProperties, options, entries) {
    const item = {
      id,
      entry
    }

    const entryProperties = this.processProperties(context, id, properties, options, entries)
    const entryPatternProperties = this.processProperties(context, id, patternProperties, options, entries)

    if (entryProperties.length) {
      item.entry.properties = entryProperties
    }

    if (entryPatternProperties.length) {
      item.entry.patternProperties = entryPatternProperties
    }

    entries.push(item)
  },
  process (context, id, source, entries = [], head = false) {
    const item = this.create(context, source)

    if (!head) {
      id = id + '/items'
    }

    if (item.properties || item.patternProperties) {
      this.object(context, id, item.entry, item.properties, item.patternProperties, item.entry.options, entries)
    } else {
      if (item.items) {
        this.process(context, id, item.items, entries)
      }

      const entry = { id, entry: item.entry }

      entries.push(entry)
    }

    return entries
  }
}
