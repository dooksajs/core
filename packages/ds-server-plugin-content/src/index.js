import dsContent from '@dooksa/ds-plugin-content'

/**
 * DsPage plugin.
 * @namespace dssContent
 */
export default {
  name: 'dssContent',
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
    ...dsContent.data
  },
  setup () {
    this.$method('dssDatabase/model', {
      name: 'content',
      fields: [
        {
          name: 'id',
          type: 'string',
          options: {
            primaryKey: true
          }
        },
        {
          name: 'groupId',
          type: 'string',
          options: {
            allowNull: false
          }
        },
        {
          name: 'language',
          type: 'string',
          options: {
            allowNull: false
          }
        },
        {
          name: 'type',
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
      ]
    })
  },
  methods: {
    async create (request, response) {

    }
  }
}
