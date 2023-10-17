import dsSection from '@dooksa/ds-plugin-section'

/**
 * DsPage plugin.
 * @namespace dsSection
 */
export default {
  name: 'dsSection',
  version: 1,
  data: {
    ...dsSection.data
  },
  setup () {
    this.$setDatabaseModel('section', [
      {
        name: 'id',
        type: 'string',
        options: {
          primaryKey: true
        }
      },
      {
        name: 'mode',
        type: 'string',
        options: {
          allowNull: false
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
      model: 'section',
      fields: [
        {
          collection: 'dsSection/items',
          name: 'data'
        },
        {
          collection: 'dsSection/mode',
          name: 'mode'
        }
      ]
    }

    // route: add section
    this.$setWebServerRoute('/section', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', options)
      ]
    })

    // route: update existing section
    this.$setWebServerRoute('/section', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', options)
      ]
    })

    // route: get a list of section
    this.$setWebServerRoute('/section', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', options)
      ]
    })

    // route: delete section
    this.$setWebServerRoute('/section', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'section',
          collections: ['dsSection/items', 'dsSection/mode']
        })
      ]
    })
  }
}
