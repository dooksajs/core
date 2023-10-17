import dsWidget from '@dooksa/ds-plugin-widget'

/**
 * Dooksa server widget model management
 * @namespace dsWidget
 */
export default {
  name: 'dsWidget',
  version: 1,
  dependencies: [
    {
      name: 'dsUser'
    },
    {
      name: 'dsComponent'
    },
    {
      name: 'dsEvent'
    },
    {
      name: 'dsLayout'
    },
    {
      name: 'dsContent'
    },
    {
      name: 'dsTemplate'
    },
    {
      name: 'dsSection'
    }
  ],
  data: {
    ...dsWidget.data
  },
  setup () {
    this.$setDatabaseModel('widget', [
      {
        name: 'id',
        type: 'string',
        options: {
          primaryKey: true
        }
      },
      {
        name: 'defaultId',
        type: 'string',
        options: {
          allowNull: false
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
        name: 'content',
        type: 'json',
        options: {
          allowNull: false
        }
      },
      {
        name: 'layout',
        type: 'string',
        options: {
          allowNull: false
        }
      },
      {
        name: 'event',
        type: 'json'
      },
      {
        name: 'mode',
        type: 'string',
        options: {
          allowNull: false
        }
      }
    ])

    // user association
    this.$setDatabaseAssociation('belongsTo', {
      source: 'widget',
      target: 'user',
      options: {
        allowNull: false
      }
    })

    // content association
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'widget',
      target: 'content',
      options: {
        through: 'widgetContent'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'content',
      target: 'widget',
      options: {
        onDelete: 'RESTRICT',
        through: 'widgetContent'
      }
    })

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'widget',
      target: 'action',
      options: {
        through: 'widgetActions'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'action',
      target: 'widget',
      options: {
        onDelete: 'RESTRICT',
        through: 'widgetActions'
      }
    })

    // layout association
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'widget',
      target: 'layout',
      options: {
        through: 'widgetLayouts'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'layout',
      target: 'widget',
      options: {
        onDelete: 'RESTRICT',
        through: 'widgetLayouts'
      }
    })

    // template association
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'widget',
      target: 'template',
      options: {
        through: 'widgetTemplates'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'template',
      target: 'widget',
      options: {
        onDelete: 'RESTRICT',
        through: 'widgetTemplates'
      }
    })

    // section association
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'section',
      target: 'widget',
      options: {
        through: 'sectionWidgets'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'widget',
      target: 'section',
      options: {
        onDelete: 'RESTRICT',
        through: 'sectionWidgets'
      }
    })

    const options = {
      model: 'widget',
      fields: [{
        collection: 'dsWidget/groups',
        name: 'groupId'
      }],
      include: [{
        model: 'component',
        fields: [{
          collection: 'dsComponent/items',
          name: 'data'
        }]
      }]
    }

    // route: add action sequences
    this.$setWebServerRoute('/widget', {
      method: 'post',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', options)
      ]
    })

    // route: update existing actions
    this.$setWebServerRoute('/layout', {
      method: 'put',
      middleware: ['dsUser/auth'],
      handlers: [
        this.$method('dsDatabase/create', options)
      ]
    })

    // route: get a list of action
    this.$setWebServerRoute('/layout', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        this.$method('dsDatabase/getById', options)
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
