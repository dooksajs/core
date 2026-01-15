import { createPlugin, mapState } from '@dooksa/create-plugin'
import { component as componentClient, stateGenerateId, pagePathToId } from '#client'
import { databaseDeleteValue, databaseGetValue, databaseSeed, serverSetRoute, pageCreate } from '#server'
import { components as defaultComponents } from '@dooksa/components'
import { createDataValue } from '#utils'

export const component = createPlugin('component', {
  state: { ...mapState(componentClient) },
  /**
   * @param {Object} options
   * @param {import('@dooksa/create-component').Component[]} [options.components]
   * @param {string[]} [options.excludeComponents=[]]
   */
  async setup ({
    components = defaultComponents,
    excludeComponents = []
  } = {}) {
    await databaseSeed('component-items')

    const activeComponents = {}

    for (let i = 0; i < components.length; i++) {
      const component = components[i]
      const id = component.id

      if (!excludeComponents.includes(id)) {
        activeComponents[id] = component
      }
    }

    // route: get a list of component
    serverSetRoute({
      path: '/component',
      middleware: ['request/queryIdIsArray'],
      handlers: [
        databaseGetValue(['component/items'])
      ]
    })

    // route: render a component by ID
    serverSetRoute({
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
          const componentItemId = stateGenerateId()
          const page = pageCreate([
            // create component data
            createDataValue({
              collection: 'component/items',
              id: componentItemId,
              value: {
                id,
                isTemplate: true
              }
            }),
            // create current path data
            createDataValue({
              collection: 'page/paths',
              id: pageId,
              value: {
                name: request.path,
                itemId: pageId
              }
            }),
            // create page items with our component
            createDataValue({
              collection: 'page/items',
              id: pageId,
              value: [componentItemId]
            })
          ])

          response.set('Content-Security-Policy', page.csp)
          response.status(200).html(page.html)
        }
      ]
    })

    // route: delete component
    serverSetRoute({
      path: '/component',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIdIsArray'],
      handlers: [
        databaseDeleteValue(['component/items'])
      ]
    })
  }
})

export default component
