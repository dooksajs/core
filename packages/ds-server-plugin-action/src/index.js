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
  },
  /** @lends dssAction */
  methods: {
  }
}
