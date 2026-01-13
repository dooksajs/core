import { createPlugin, mapState } from '@dooksa/create-plugin'
import { stateSetValue, metadata as metadataClient } from '../client/index.js'
import { databaseSeed, databaseGetValue } from './database.js'
import { httpSetRoute } from './http.js'

/**
 * @import {DsPluginMetadata, ActiveAction } from '@dooksa/create-plugin/types'
 */

export const metadata = createPlugin('metadata', {
  state: {
    ...mapState(metadataClient)
  },
  /**
   * @param {Object} param
   * @param {Object[]} param.plugins
   * @param {string} param.plugins[].name
   * @param {DsPluginMetadata} param.plugins[].metadata
   * @param {ActiveAction[]} param.actions
   */
  async setup ({ plugins, actions }) {
    await databaseSeed('metadata-currentLanguage')
    await databaseSeed('metadata-languages')
    await databaseSeed('metadata-plugins')
    await databaseSeed('metadata-actions')
    await databaseSeed('metadata-parameters')

    // set plugin metadata
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]

      stateSetValue({
        name: 'metadata/plugins',
        value: plugin.metadata,
        options: {
          id: plugin.name
        }
      })
    }

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]

      for (let i = 0; i < action.metadata.length; i++) {
        const metadata = Object.assign({}, action.metadata[i])
        const id = metadata.method + '_' + metadata.id

        stateSetValue({
          name: 'metadata/actions',
          value: metadata,
          options: { id }
        })
      }

      if (action.parameters) {
        stateSetValue({
          name: 'metadata/parameters',
          value: action.parameters,
          options: {
            id: action.name
          }
        })
      }
    }

    // route: get a list of languages
    httpSetRoute({
      path: '/metadata/languages',
      handlers: [
        databaseGetValue(['metadata/languages'])
      ]
    })

    httpSetRoute({
      path: '/metadata/plugins',
      handlers: [
        databaseGetValue(['metadata/plugins'])
      ]
    })

    httpSetRoute({
      path: '/metadata/actions',
      handlers: [
        databaseGetValue(['metadata/actions'])
      ]
    })

    httpSetRoute({
      path: '/metadata/parameters',
      middleware: ['request/queryIdIsArray'],
      handlers: [
        databaseGetValue(['metadata/parameters'])
      ]
    })
  }
})

export default metadata
