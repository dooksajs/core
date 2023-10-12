import dsContent from '@dooksa/ds-plugin-content'

/**
 * DsPage plugin.
 * @namespace dsContent
 */
export default {
  name: 'dsContent',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    }
  ],
  data: {
    ...dsContent.data
  },
  setup () {
    this.$setDatabaseModel('content', [
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
    ])

    const fields = [
      {
        collection: 'dsContent/items',
        name: 'data'
      },
      {
        collection: 'dsContent/type',
        name: 'type'
      },
      {
        collection: 'dsContent/language',
        name: 'language'
      }
    ]

    // route: add content
    this.$setWebServerRoute('/content', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', { model: 'content', fields })
      ]
    })

    this.$setWebServerRoute('/content', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', { model: 'content', fields })
      ]
    })

    // route: delete content
    this.$setWebServerRoute('/action', {
      method: 'delete',
      middleware: ['dsUser/auth', 'request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/deleteById', {
          model: 'content',
          collections: ['dsContent/items', 'dsContent/type', 'dsContent/language']
        })
      ]
    })

    // route: get a list of content
    this.$setWebServerRoute('/content', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', { model: 'content', fields })
      ]
    })
  }
}
