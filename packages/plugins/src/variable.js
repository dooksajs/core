import createPlugin from '@dooksa/create-plugin'
import { dataGetValue, dataSetValue } from './data.js'
import { generateId } from '@dooksa/utils'
import { getValue } from './utils/getValue.js'

const variable = createPlugin('variable', {
  metadata: {
    title: 'Variable',
    description: 'Management of variables',
    icon: ''
  },
  models: {
    values: {
      type: 'collection',
      items: {
        type: 'object'
      }
    },
    scopes: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'string'
        },
        uniqueItems: true
      }
    }
  },
  actions: {
    getValue: {
      metadata: {
        title: 'Get variable',
        description: 'Retrieve variable value',
        icon: 'mdi:application-variable'
      },
      /**
       * Get variable value
       * @param {Object} props
       * @param {string} [props.scope]
       * @param {string} [props.prefixId]
       * @param {string} [props.suffixId]
       * @param {string} props.query
       */
      method (props, { context }) {
        if (props.scope) {
          // get variable from specific scope
          const value = dataGetValue({
            name: 'variable/values',
            id: props.scope
          })

          if (!value.isEmpty) {
            let query = props.query

            if (props.prefixId) {
              query = props.prefixId + query
            }

            if (props.suffixId) {
              const splitQuery = query.split('.')

              splitQuery[0] = splitQuery[0] + props.suffixId
              query = splitQuery.join('.')
            }

            return getValue(value.item, query)
          }

          return
        }

        // get scopes
        const scopes = dataGetValue({
          name: 'variable/scopes',
          id: context.rootId
        }).item

        for (let i = 0; i < scopes.length; i++) {
          // search for variable in scope
          const values = dataGetValue({
            name: 'variable/values',
            id: scopes[i]
          })

          if (!values.isEmpty) {
            let query = props.query

            if (props.prefixId) {
              query = props.prefixId + query
            }

            if (props.suffixId) {
              const splitQuery = query.split('.')

              query = splitQuery[0] + props.suffixId

              for (let i = 1; i < splitQuery.length; i++) {
                query = query + query
              }
            }

            const value = getValue(values.item, query)

            if (value) {
              return value
            }
          }
        }
      }
    },
    setValue: {
      metadata: {
        title: 'Set value',
        description: 'Store a value within a scope',
        icon: 'mdi:format-list-numbered'
      },
      method (props, { context }) {
        const values = {}
        const valueIds = []

        for (let i = 0; i < props.values.length; i++) {
          const item = props.values[i]
          let valueId = item.id || generateId()

          if (item.prefixId) {
            valueId = item.prefixId + valueId
          }

          if (item.suffixId) {
            valueId = valueId + item.suffixId
          }

          valueIds.push(valueId)
          values[valueId] = item.value
        }

        if (props.scope) {
          dataSetValue({
            name: 'component/belongsToScopes',
            value: props.scope,
            options: {
              id: context.id,
              update: {
                method: 'push'
              }
            }
          })

          return dataSetValue({
            name: 'variable/values',
            value: values,
            options: {
              id: props.scope,
              merge: true
            }
          })
        } else {
          const scope = dataGetValue({
            name: 'variable/scopes',
            id: context.groupId
          }).item

          // assign values to matching variables in parent scope
          for (let i = 0; i < scope.length; i++) {
            const id = scope[i]
            const values = dataGetValue({
              name: 'variable/values',
              id
            })

            if (!values.isEmpty) {
              let hasValue = false
              const value = {}

              for (let i = 0; i < valueIds.length; i++) {
                const id = valueIds[i]

                if (values.item.hasOwnProperty(id)) {
                  hasValue = true
                  value[id] = values[id]
                  delete values[id]
                  valueIds.splice(i, 1)
                }
              }

              if (hasValue) {
                dataSetValue({
                  name: 'variable/values',
                  value,
                  options: {
                    id,
                    merge: true
                  }
                })
              }
            }
          }

          // assign value to current context
          if (valueIds.length) {
            dataSetValue({
              name: 'variable/values',
              value: values,
              options: {
                id: context.groupId,
                merge: true
              }
            })
          }
        }
      }
    }
  }
})

const variable_getValue = variable.actions.getValue
const variable_setValue = variable.actions.setValue

export {
  variable,
  variable_getValue,
  variable_setValue
}

export default variable
