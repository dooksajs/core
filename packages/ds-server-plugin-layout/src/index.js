import dsLayout from '@dooksa/ds-plugin-layout'

/**
 * Dooksa server layout model management
 * @namespace dsLayout
 */
export default {
  name: 'dsLayout',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    },
    {
      name: 'dsComponent'
    }
  ],
  data: {
    ...dsLayout.data
  },
  setup () {
    this.$setDatabaseModel('layout', [
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
    ], {
      timestamps: false
    })

    // component association
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'layout',
      target: 'component',
      options: {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        through: 'layoutComponents'
      }
    })

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'component',
      target: 'layout',
      options: {
        onDelete: 'RESTRICT',
        through: 'layoutComponents'
      }
    })

    const fields = [{
      collection: 'dsLayout/items',
      name: 'data'
    }]

    // route: add action sequences
    this.$setWebServerRoute('/layout', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', {
          model: 'layout',
          fields,
          include: [{
            model: 'component',
            fields: [{
              collection: 'dsComponent/items',
              name: 'data'
            }]
          }]
        })
      ]
    })

    // route: update existing actions
    this.$setWebServerRoute('/layout', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', { model: 'layout', fields })
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/layout', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', {
          model: 'layout',
          fields,
          include: [{
            model: 'component',
            fields: [{
              collection: 'dsComponent/items',
              name: 'data'
            }]
          }]
        })
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/layout', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'layout',
          collections: ['dsLayout/items']
        })
      ]
    })
  }
}
