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
    this.$method('dssWebServer/route', {
      path: '/action',
      method: 'post',
      handler: this._create.bind(this)
    })

    // route: update existing actions
    this.$method('dssWebServer/route', {
      path: '/action',
      method: 'put',
      handler: this._update.bind(this)
    })

    // route: get a list of action
    this.$method('dssWebServer/route', {
      path: '/action',
      method: 'get',
      handler: this._get.bind(this)
    })

    // route: delete action
    this.$method('dssWebServer/route', {
      path: '/action',
      method: 'delete',
      handler: this._delete.bind(this)
    })

    // route: add action sequences
    this.$method('dssWebServer/route', {
      path: '/action/sequence',
      method: 'post',
      handler: this._createSequence.bind(this)
    })

    // route: update existing actions
    this.$method('dssWebServer/route', {
      path: '/action/sequence',
      method: 'put',
      handler: this._updateSequence.bind(this)
    })

    // route: get a list of action
    this.$method('dssWebServer/route', {
      path: '/action/sequence',
      method: 'get',
      handler: this._getSequence.bind(this)
    })

    // route: delete action sequence
    this.$method('dssWebServer/route', {
      path: '/action/sequence',
      method: 'delete',
      handler: this._deleteSequence.bind(this)
    })

    // route: add action sequence entries
    this.$method('dssWebServer/route', {
      path: '/action/recipe',
      method: 'post',
      handler: this._createSequenceEntry.bind(this)
    })

    // route: update existing action sequence entries
    this.$method('dssWebServer/route', {
      path: '/action/recipe',
      method: 'put',
      handler: this._updateSequenceEntry.bind(this)
    })

    // route: get a list of action sequence entries
    this.$method('dssWebServer/route', {
      path: '/action/recipe',
      method: 'get',
      handler: this._getSequenceEntry.bind(this)
    })

    // route: delete action sequence entries
    this.$method('dssWebServer/route', {
      path: '/action/recipe',
      method: 'delete',
      handler: this._deleteSequenceEntry.bind(this)
    })
  },
  /** @lends dssAction */
  methods: {
    async _create (request, response) {

    }
  }
}
