import dsAction from '@dooksa/ds-plugin-action'

/**
 * DsPage plugin.
 * @namespace dsAction
 */
export default {
  name: 'dsAction',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsAction.data
  },
  setup () {
    this.$setDatabaseModel('action', [
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

    this.$setDatabaseModel('sequence', [
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

    this.$setDatabaseModel('actionRecipe', [
      {
        name: 'id',
        type: 'string',
        options: {
          primaryKey: true
        }
      },
      {
        name: 'name',
        type: 'string'
      }
    ])

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'action',
      target: 'sequence',
      options: {
        through: 'actionSequences'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'sequence',
      target: 'action',
      options: {
        through: 'actionSequences'
      }
    })

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'sequence',
      target: 'actionRecipe',
      options: {
        through: 'actionRecipeSequences'
      }
    })

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'actionRecipe',
      target: 'sequence',
      options: {
        through: 'actionRecipeSequences'
      }
    })

    const actionFields = [{
      collection: 'dsAction/items',
      name: 'data'
    }]

    // route: add actions
    this.$setWebServerRoute('/action', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', {
          model: 'action',
          fields: actionFields
        })
      ]
    })

    // route: update existing actions
    this.$setWebServerRoute('/action', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', {
          model: 'action',
          fields: actionFields
        })
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/action', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', {
          model: 'action',
          fields: actionFields
        })
      ]
    })

    // route: delete action
    this.$setWebServerRoute('/action', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'action',
          collections: ['dsAction/items']
        })
      ]
    })

    const actionSequenceFields = [{
      collection: 'dsAction/sequence',
      name: 'data'
    }]

    // route: add action sequences
    this.$setWebServerRoute('/action/sequence', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', {
          model: 'sequence',
          fields: actionSequenceFields
        })
      ]
    })

    // route: update existing actions
    this.$setWebServerRoute('/action/sequence', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', {
          model: 'sequence',
          fields: actionSequenceFields
        })
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/action/sequence', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', {
          model: 'action',
          fields: actionSequenceFields
        })
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/action/sequence', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'action',
          collections: ['dsAction/sequence']
        })
      ]
    })

    // // route: add action sequence entries
    // this.$setWebServerRoute('/action/recipe', {
    //   method: 'post',
    //   middleware: ['dsUser/auth'],
    //   handlers: [this._createSequenceEntry.bind(this)]
    // })

    // // route: update existing action sequence entries
    // this.$setWebServerRoute('/action/recipe', {
    //   method: 'put',
    //   middleware: ['dsUser/auth'],
    //   handlers: [this._updateSequenceEntry.bind(this)]
    // })

    // // route: get a list of action sequence entries
    // this.$setWebServerRoute('/action/recipe', {
    //   method: 'get',
    //   handlers: [this._getSequenceEntry.bind(this)]
    // })

    // // route: delete action sequence entries
    // this.$setWebServerRoute('/action/recipe', {
    //   method: 'delete',
    //   middleware: ['dsUser/auth'],
    //   handlers: [this._deleteSequenceEntry.bind(this)]
    // })
  }
}
