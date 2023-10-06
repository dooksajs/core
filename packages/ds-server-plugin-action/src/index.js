import dsAction from '@dooksa/ds-plugin-action'

/**
 * DsPage plugin.
 * @namespace dssAction
 */
export default {
  name: 'dssAction',
  version: 1,
  dependencies: [
    {
      name: 'dssDatabase'
    },
    {
      name: 'dssWebServer'
    },
    {
      name: 'dssUser'
    }
  ],
  data: {
    ...dsAction.data
  },
  setup () {
    this.$method('dssDatabase/model', {
      name: 'action',
      fields: [
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
      ]
    })

    this.$method('dssDatabase/model', {
      name: 'sequence',
      fields: [
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
      ]
    })

    this.$method('dssDatabase/model', {
      name: 'actionRecipe',
      fields: [
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
      ]
    })

    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'action',
      target: 'sequence',
      options: {
        through: 'actionSequences'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'sequence',
      target: 'action',
      options: {
        through: 'actionSequences'
      }
    })

    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'sequence',
      target: 'actionRecipe',
      options: {
        through: 'actionRecipeSequences'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'actionRecipe',
      target: 'sequence',
      options: {
        through: 'actionRecipeSequences'
      }
    })

    // route: add actions
    this.$method('dssWebServer/addRoute', {
      path: '/action',
      method: 'post',
      middleware: ['dssUser/auth'],
      handlers: [this._create.bind(this)]
    })

    // route: update existing actions
    this.$method('dssWebServer/addRoute', {
      path: '/action',
      method: 'put',
      middleware: ['dssUser/auth'],
      handlers: [this._update.bind(this)]
    })

    // route: get a list of action
    this.$method('dssWebServer/addRoute', {
      path: '/action',
      method: 'get',
      handlers: [this._get.bind(this)]
    })

    // route: delete action
    this.$method('dssWebServer/addRoute', {
      path: '/action',
      method: 'delete',
      middleware: ['dssUser/auth'],
      handlers: [this._delete.bind(this)]
    })

    // route: add action sequences
    this.$method('dssWebServer/addRoute', {
      path: '/action/sequence',
      method: 'post',
      middleware: ['dssUser/auth'],
      handlers: [this._createSequence.bind(this)]
    })

    // route: update existing actions
    this.$method('dssWebServer/addRoute', {
      path: '/action/sequence',
      method: 'put',
      middleware: ['dssUser/auth'],
      handlers: [this._updateSequence.bind(this)]
    })

    // route: get a list of action
    this.$method('dssWebServer/addRoute', {
      path: '/action/sequence',
      method: 'get',
      handlers: [this._getSequence.bind(this)]
    })

    // route: delete action sequence
    this.$method('dssWebServer/addRoute', {
      path: '/action/sequence',
      method: 'delete',
      middleware: ['dssUser/auth'],
      handlers: [this._deleteSequence.bind(this)]
    })

    // route: add action sequence entries
    this.$method('dssWebServer/addRoute', {
      path: '/action/recipe',
      method: 'post',
      middleware: ['dssUser/auth'],
      handlers: [this._createSequenceEntry.bind(this)]
    })

    // route: update existing action sequence entries
    this.$method('dssWebServer/addRoute', {
      path: '/action/recipe',
      method: 'put',
      middleware: ['dssUser/auth'],
      handlers: [this._updateSequenceEntry.bind(this)]
    })

    // route: get a list of action sequence entries
    this.$method('dssWebServer/addRoute', {
      path: '/action/recipe',
      method: 'get',
      handlers: [this._getSequenceEntry.bind(this)]
    })

    // route: delete action sequence entries
    this.$method('dssWebServer/addRoute', {
      path: '/action/recipe',
      method: 'delete',
      middleware: ['dssUser/auth'],
      handlers: [this._deleteSequenceEntry.bind(this)]
    })
  },
  /** @lends dssAction */
  methods: {
    async _create (request, response) {
      response.send('ok')
    },
    async _createSequence (request, response) {

    },
    async _createSequenceEntry (request, response) {

    },
    async _delete (request, response) {

    },
    async _deleteSequence (request, response) {

    },
    async _deleteSequenceEntry (request, response) {

    },
    async _get (request, response) {

    },
    async _getSequence (request, response) {

    },
    async _getSequenceEntry (request, response) {

    },
    async _update (request, response) {

    },
    async _updateSequence (request, response) {

    },
    async _updateSequenceEntry (request, response) {

    }
  }
}
