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
        through: 'widgetContent'
      }
    })

    // events
    this.$setDatabaseModel('widgetEvent', [
      {
        name: 'id',
        type: 'string',
        options: {
          primaryKey: true
        }
      },
      {
        name: 'key',
        type: 'string',
        options: {
          allowNull: false
        }
      },
      {
        name: 'name',
        type: 'string',
        options: {
          allowNull: false
        }
      }
    ])

    // event association
    this.$setDatabaseAssociation('belongsTo', {
      source: 'widgetEvent',
      target: 'widget',
      options: {
        foreignKey: {
          allowNull: false
        }
      }
    })

    this.$setDatabaseAssociation('belongsToMany', {
      source: 'widgetEvent',
      target: 'actionRecipe',
      options: {
        through: 'widgetEventActions'
      }
    })
    this.$setDatabaseAssociation('belongsToMany', {
      source: 'actionRecipe',
      target: 'widgetEvent',
      options: {
        through: 'widgetEventActions'
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
        through: 'sectionWidgets'
      }
    })
  }
}
