import dsEvent from '@dooksa/ds-plugin-event'

/**
 * Dooksa server event model management.
 * @namespace dssEvent
 */
export default {
  name: 'dssEvent',
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
    ...dsEvent.data
  },
  setup () {
    this.$method('dssDatabase/model', {
      name: 'event',
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
  /** @lends dssEvent */
  methods: {
    validate ({ data, pageId }) {
      const result = []

      for (const id in data) {
        if (Object.hasOwnProperty.call(data, id)) {
          const source = data[id]
          const setData = this.$setDataValue('dssEvent/listeners', {
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
    },
    create ({
      id = this.$method('dsData/generateId'),
      data
    }) {
      return new Promise((resolve, reject) => {
        const result = this.$setDataValue('dssEvent/listeners', {
          source: data,
          options: { id }
        })

        if (!result.isValid) {
          throw new Error(result.error)
        }

        const Event = this.$getDataValue('dssDatabase/model', { id: 'event' })

        Event.findCreateFind({
          where: { id },
          defaults: data
        })
          .then(([entry, created]) => {
            if (!created) {
              // update data
              entry.data = data

              entry.save()
                .then(() => {
                  resolve({
                    id,
                    message: 'Sucessfully created event'
                  })
                })
                .catch((error) => reject(error))
            } else {
              resolve({
                id,
                message: 'Sucessfully created event'
              })
            }
          })
      })
    }
  }
}
