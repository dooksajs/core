import dsTemplate from '@dooksa/ds-plugin-template'

/**
 * DsPage plugin.
 * @namespace dssTemplate
 */
export default {
  name: 'dssTemplate',
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
    ...dsTemplate.data
  },
  setup () {
    this.$method('dssDatabase/model', {
      name: 'template',
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
  },
  /** @lends dssTemplate */
  methods: {
  }
}
