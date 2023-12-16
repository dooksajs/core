import { dsWidget } from '@dooksa/ds-plugin'
import { definePlugin } from '@dooksa/ds-scripts'

/**
 * Dooksa server widget model management
 * @namespace dsWidget
 */
export default definePlugin({
  name: 'dsWidget',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    },
    {
      name: 'dsComponent'
    },
    {
      name: 'dsEvent'
    },
    {
      name: 'dsLayout'
    },
    {
      name: 'dsContent'
    },
    {
      name: 'dsTemplate'
    },
    {
      name: 'dsSection'
    }
  ],
  data: {
    ...dsWidget.data
  },
  setup () {
    this.$seedDatabase('ds-widget-items')
    this.$seedDatabase('ds-widget-content')
    this.$seedDatabase('ds-widget-events')
    this.$seedDatabase('ds-widget-groups')
    this.$seedDatabase('ds-widget-mode')
    this.$seedDatabase('ds-widget-layouts')
    this.$seedDatabase('ds-widget-sections')

    // route: get a list of action
    this.$setWebServerRoute('/layout', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$getDatabaseValue(['dsWidget/items'])
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/layout', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$deleteDatabaseValue(['dsWidget/items'])
      ]
    })
  }
})
