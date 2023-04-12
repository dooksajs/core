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

            if (item.dsActionItems) {
              app.$setDataValue({
                name: 'dsAction/actions',
                source: item.dsActionItems,
                options: {
                  source: {
                    merge: true
                  }
                }
              })
            }

            if (item.dsActionSequence) {
              if (item.dsActionSequence.actions) {
                app.$setDataValue({
                  name: 'dsAction/sequenceActions',
                  source: item.dsActionSequence.actions,
                  options: {
                    id: item.dsActionSequence.id
                  }
                })
              }

              if (item.dsActionSequence.conditions) {
                app.$setDataValue({
                  name: 'dsAction/sequenceConditions',
                  source: item.dsActionSequence.conditions,
                  options: {
                    id: item.dsActionSequence.id
                  }
                })
              }
            }

            // assign the method to a action sequenceId
            metadata.actions = { ...metadata.actions, [key]: item.dsActionSequence.id }

            if (item.params) {
              app.$setDataValue({
                name: 'dsParameter/items',
                source: item.params,
                options: {
                  source: {
                    merge: true
                  }
                }
              })
            }
          }
        }
      }

      const templateElements = div.querySelectorAll('template')

      // construct templates
      for (let i = 0; i < templateElements.length; i++) {
        const rootElement = templateElements[i]
        const dsWidgetMode = rootElement.getAttribute('ds-widget-mode') || 'default'
        const builtTemplate = new Promise((resolve, reject) => {
          app.$action('dsParse/toWidget',
            {
              rootElement: rootElement.content,
              isTemplate: true,
              dsWidgetMode,
              metadata
            },
            {
              onSuccess: (item) => resolve({ metadata, dsWidgetMode, item }),
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
            const instance = {
              templates: []
            }

            for (let i = 0; i < items.length; i++) {
              const { item, dsWidgetMode, metadata } = items[i]

              // add templates
              app.$setDataValue({
                name: 'dsTemplate/entry',
                source: item.templateEntry,
                options: {
                  id: item.templateEntry
                }
              })

              app.$setDataValue({
                name: 'dsTemplate/items',
                source: item.template,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              app.$setDataValue({
                name: 'dsLayout/items',
                source: item.layouts.items,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              app.$setDataValue({
                name: 'dsLayout/entry',
                source: item.layouts.head,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              app.$setDataValue({
                name: 'dsComponent/items',
                source: item.components,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              // join widget by template id
              instance.templates.push({
                id: item.templateEntry,
                mode: dsWidgetMode
              })

              // append template metadata
              instance.metadata = metadata
            }

            result.push(instance)
          }
        }

        resolve(result)
      })
      .catch(error => reject(error))
  })
}

export default buildTemplates
