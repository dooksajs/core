import dsWidget from '@dooksa/ds-plugin-widget'

/**
 * Dooksa server widget model management
 * @namespace dssWidget
 */
export default {
  name: 'dssWidget',
  version: 1,
  dependencies: [
    {
      name: 'dssDatabase'
    },
    {
      name: 'dssComponent'
    },
    {
      name: 'dssEvent'
    },
    {
      name: 'dssLayout'
    },
    {
      name: 'dssContent'
    },
    {
      name: 'dssTemplate'
    },
    {
      name: 'dssSection'
    }
  ],
  data: {
    ...dsWidget.data
  },
  setup () {
    this.$method('dssDatabase/model', {
      name: 'widget',
      fields: [
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
      ]
    })

    // user association
    this.$method('dssDatabase/association', {
      type: 'belongsTo',
      source: 'widget',
      target: 'user',
      options: {
        allowNull: false
      }
    })

    // content association
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'widget',
      target: 'content',
      options: {
        through: 'widgetContent'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'content',
      target: 'widget',
      options: {
        through: 'widgetContent'
      }
    })

    // events
    this.$method('dssDatabase/model', {
      name: 'widgetEvent',
      fields: [
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
      ]
    })

    // event association
    this.$method('dssDatabase/association', {
      type: 'belongsTo',
      source: 'widgetEvent',
      target: 'widget',
      options: {
        foreignKey: {
          allowNull: false
        }
      }
    })

    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'widgetEvent',
      target: 'actionSequenceGroup',
      options: {
        through: 'widgetEventActions'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'actionSequenceGroup',
      target: 'widgetEvent',
      options: {
        through: 'widgetEventActions'
      }
    })

    // layout association
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'widget',
      target: 'layout',
      options: {
        through: 'widgetLayouts'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'layout',
      target: 'widget',
      options: {
        through: 'widgetLayouts'
      }
    })

    // template association
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'widget',
      target: 'template',
      options: {
        through: 'widgetTemplates'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'template',
      target: 'widget',
      options: {
        through: 'widgetTemplates'
      }
    })

    // section association
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'section',
      target: 'widget',
      options: {
        through: 'sectionWidgets'
      }
    })
    this.$method('dssDatabase/association', {
      type: 'belongsToMany',
      source: 'widget',
      target: 'section',
      options: {
        through: 'sectionWidgets'
      }
    })
  },
  /** @lends dssWidget */
  methods: {
    save ({ data }) {
      // const promises = []
      // const Widget = this.$getDataValue('dssDatabase/models', { id: 'widget' })

      // for (const id in data.items) {
      //   if (Object.hasOwnProperty.call(data.items, id)) {
      //     const groupId = data.items[id]
      //     const createWidget = Widget.create({ id, groupId })

      //     promises.push(createWidget)
      //   }
      // }

      // const WidgetContent = this.$getDataValue('dssDatabase/models', { id: 'widgetContent' })

      // for (const key in object) {
      //   if (Object.hasOwnProperty.call(object, key)) {
      //     const element = object[key]
      //   }
      // }
      // const WidgetView = this.$getDataValue('dssDatabase/models', { id: 'widgetView' })
    },
    validate (data) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const source = data[key]
          const setData = this.$setDataValue('dssWidget/' + key, {
            source,
            options: {
              source: {
                merge: true
              }
            }
          })

          if (!setData.isValid) {
            return false
          }
        }
      }

      return true
    }
  }
}
