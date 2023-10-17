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

    this.$setDatabaseModel('actionBlock', [
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

    this.$setDatabaseModel('actionSequence', [
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

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'actionBlock',
      target: 'actionSequence',
      options: {
        onDelete: 'RESTRICT',
        through: 'actionBlockSequences'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'actionSequence',
      target: 'actionBlock',
      options: {
        through: 'actionBlockSequences'
      }
    })

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'actionSequence',
      target: 'action',
      options: {
        onDelete: 'RESTRICT',
        through: 'actionActionSequence'
      }
    })

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'action',
      target: 'actionSequence',
      options: {
        through: 'actionActionSequence'
      }
    })

    const actionOptions = {
      model: 'action',
      fields: [{
        collection: 'dsAction/items',
        name: 'data'
      }],
      include: [{
        model: 'actionSequence',
        fields: [{
          collection: 'dsAction/sequences',
          name: 'data'
        }],
        include: [{
          model: 'actionBlock',
          fields: [{
            collection: 'dsAction/blocks',
            name: 'data'
          }]
        }]
      }]
    }

    // route: add action sequence entries
    this.$setWebServerRoute('/action', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [this.$method('dsDatabase/create', actionOptions)]
    })

    // route: update existing action sequence entries
    this.$setWebServerRoute('/action', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [this.$method('dsDatabase/create', actionOptions)]
    })

    // route: get a list of action sequence entries
    this.$setWebServerRoute('/action', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [this.$method('dsDatabase/getById', actionOptions)]
    })

    // route: delete action sequence entries
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

    const actionSequenceOptions = {
      model: 'actionSequence',
      fields: [{
        collection: 'dsAction/sequences',
        name: 'data'
      }],
      include: [{
        model: 'actionBlock',
        fields: [{
          collection: 'dsAction/blocks',
          name: 'data'
        }]
      }]
    }

    // route: add action sequences
    this.$setWebServerRoute('/action/sequence', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', actionSequenceOptions)
      ]
    })

    // route: update existing actions
    this.$setWebServerRoute('/action/sequence', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', actionSequenceOptions)
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/action/sequence', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', actionSequenceOptions)
      ]
    })

    // route: delete action sequence
    this.$setWebServerRoute('/action/sequence', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'actionSequence',
          collections: ['dsAction/sequences']
        })
      ]
    })

    const blockOptions = {
      model: 'actionBlock',
      fields: [{
        collection: 'dsAction/blocks',
        name: 'data'
      }]
    }

    // route: add action blocks
    this.$setWebServerRoute('/action/block', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', blockOptions)
      ]
    })

    // route: update existing action blocks
    this.$setWebServerRoute('/action/block', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', blockOptions)
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/action/block', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', blockOptions)
      ]
    })

    // route: delete action
    this.$setWebServerRoute('/action/block', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'actionBlock',
          collections: ['dsAction/blocks']
        })
      ]
    })
  },
  methods: {
    _create (request, response) {

    }
  }
}
