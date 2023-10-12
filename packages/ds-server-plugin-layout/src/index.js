import dsLayout from '@dooksa/ds-plugin-layout'

/**
 * Dooksa server layout model management
 * @namespace dssLayout
 */
export default {
  name: 'dssLayout',
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
    },
    {
      name: 'dssComponent'
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
        through: 'layoutComponents'
      }
    })
  },
  /** @lends dssLayout */
  methods: {
    validate ({ data, pageId }) {
      const result = []

      for (const id in data) {
        if (Object.hasOwnProperty.call(data, id)) {
          const source = data[id]
          const setData = this.$setDataValue('dssLayout/items', {
            source,
            options: { id }
          })

          if (!setData.isValid) {
            return false
          }

          // add primary key
          source.id = id
          source.pageId = pageId
          result.push(source)
        }
      }

      return result
    }
  }
}
