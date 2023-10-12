import dsComponent from '@dooksa/ds-plugin-component'

/**
 * DsPage plugin.
 * @namespace dsComponent
 */
export default {
  name: 'dsComponent',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsComponent.data
  },
  setup () {
    this.$setDatabaseModel('component', [
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
          unique: true,
          allowNull: false
        }
      }
    ], {
      timestamps: false
    })

    const fields = [{
      collection: 'dsComponent/items',
      name: 'data'
    }]

    // route: add action sequences
    this.$setWebServerRoute('/component', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', { model: 'component', fields })
      ]
    })

    // route: update existing actions
    this.$setWebServerRoute('/component', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', { model: 'component', fields })
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/component', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', { model: 'component', fields })
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/component', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'component',
          collections: ['dsComponent/items']
        })
      ]
    })
  }
}
