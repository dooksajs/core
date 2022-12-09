const buildTemplates = (app, templates) => {
  return new Promise((resolve, reject) => {
    const builtTemplates = []

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i]
      const div = document.createElement('div')

      // prepare template
      div.innerHTML = template

      // fetch script tag
      const templateScript = div.querySelector('script')

      // check if script exists
      if (!templateScript) {
        console.error(templates, 'is missing <script> tag')
        break
      }

      // execute script
      const metadata = new Function(templateScript.textContent)() // eslint-disable-line

      // setup any actions
      if (metadata.methods) {
        for (const key in metadata.methods) {
          if (Object.prototype.hasOwnProperty.call(metadata.methods, key)) {
            const items = metadata.methods[key]
            const item = app.$method('dsParse/toActionSequence', items)

            app.$method('dsAction/set', item)
            // assign the method to a action sequenceId
            metadata.actions = { ...metadata.actions, [key]: item.dsActionSequence.id }

            if (item.params) {
              app.$method('dsParameter/set', item.params)
            }
          }
        }
      }

      const templateElements = div.querySelectorAll('template')

      // construct templates
      for (let i = 0; i < templateElements.length; i++) {
        const rootElement = templateElements[i]
        const view = rootElement.getAttribute('ds-view') || 'default'
        const builtTemplate = new Promise((resolve, reject) => {
          app.$action('dsParse/toWidget',
            {
              rootElement: rootElement.content,
              isTemplate: true,
              metadata
            },
            {
              onSuccess: (item) => resolve({ metadata, view, item }),
              onError: (result) => reject(result)
            }
          )
        })

        builtTemplates.push(builtTemplate)
      }
    }

    Promise.all(builtTemplates)
      .then(results => {
        // group templates by id
        const templateGroup = results.reduce((acc, obj) => {
          const key = obj.metadata.id
          const curGroup = acc[key] ?? []

          return { ...acc, [key]: [...curGroup, obj] }
        }, {})

        const result = []

        // insert widgets sorted by template view
        for (const key in templateGroup) {
          if (Object.hasOwnProperty.call(templateGroup, key)) {
            const items = templateGroup[key]
            const widget = {
              item: {
                layout: {}
              }
            }

            for (let i = 0; i < items.length; i++) {
              const { item, view, metadata } = items[i]

              // add templates
              app.$method('dsTemplate/set', { id: item.templateEntry, item })

              // join widget by template id
              widget.item.layout[view] = {
                id: app.$method('dsUtilities/generateId'), // ISSUE: what is this id for
                templateId: item.templateEntry
              }

              // append template metadata
              widget.metadata = metadata
            }

            result.push(widget)
          }
        }

        resolve(result)
      })
      .catch(error => reject(error))
  })
}

export default buildTemplates
