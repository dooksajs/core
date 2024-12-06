import { createPlugin, mapSchema } from '@dooksa/create-plugin'
import { component as componentClient, dataGenerateId, pagePathToId } from '#client'
import { databaseDeleteValue, databaseGetValue, databaseSeed, httpSetRoute } from '#server'
import { components as defaultComponents } from '@dooksa/components'
import { pageCreate } from '#server'
import { createDataValue } from '#utils'

export const component = createPlugin('component', {
  schema: { ...mapSchema(componentClient) },
  /**
   * @param {Object} options
   * @param {import('@dooksa/create-component').Component[]} [options.components]
   * @param {string[]} [options.excludeComponents=[]]
   */
  setup ({
    components = defaultComponents,
    excludeComponents = []
  } = {}) {
    databaseSeed('component-items')

    const activeComponents = {}

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const id = component.id

      if (!excludeComponents.includes(id)) {
        activeComponents[id] = component
      }
    }

    // route: get a list of component
    httpSetRoute({
      path: '/component',
      middleware: ['request/queryIsArray'],
      handlers: [
        databaseGetValue(['component/items'])
      ]
    })

    // route: render a component by ID
    httpSetRoute({
      path: '/component/:id',
      handlers: [
        (request, response) => {
          const id = request.params.id

          /**
           * @TODO need a 404 page response
           */
          if (!activeComponents[id]) {
            return response.status(404).send()
          }

          const pageId = pagePathToId(request.path)
          const componentItemId = dataGenerateId()
          const page = pageCreate([
            // create component data
            createDataValue({
              collection: 'component/items',
              id: componentItemId,
              data: {
                id,
                isTemplate: true
              }
            }),
            // create current path data
            createDataValue({
              collection: 'page/paths',
              id: pageId,
              data: {
                name: request.path,
                itemId: pageId
              }
            }),
            // create page items with our component
            createDataValue({
              collection: 'page/items',
              id: pageId,
              data: [componentItemId]
            })
          ])

          response.set('Content-Security-Policy', page.csp)
          response.status(200).html(page.html)
        }
      ]
    })

    // route: delete component
    httpSetRoute({
      path: '/component',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['component/items'])
      ]
    })
  }
})

export default component
