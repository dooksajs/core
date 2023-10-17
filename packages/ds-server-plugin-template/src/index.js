import dsTemplate from '@dooksa/ds-plugin-template'

/**
 * DsPage plugin.
 * @namespace dsTemplate
 */
export default {
  name: 'dsTemplate',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsTemplate.data
  },
  setup () {
    this.$setDatabaseModel('template', [
      {
        name: 'id',
        type: 'string',
        options: {
          primaryKey: true
        }
      },
      {
        name: 'data',
        type: 'json',
        options: {
          allowNull: false
        }
      }
    ])

    const options = {
      model: 'template',
      fields: [{
        collection: 'dsTemplate/items',
        name: 'data'
      }]
    }

    // route: add section
    this.$setWebServerRoute('/template', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', options)
      ]
    })

    // route: update existing section
    this.$setWebServerRoute('/template', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', options)
      ]
    })

    // route: get a list of section
    this.$setWebServerRoute('/template', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', options)
      ]
    })

    // route: delete section
    this.$setWebServerRoute('/template', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'section',
          collections: ['dsTemplate/items']
        })
      ]
    })
  }
}
