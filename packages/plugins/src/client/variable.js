import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, stateSetValue } from '#client'
import { generateId, getValue } from '@dooksa/utils'

/**
 * @import {VariableGetValue, VariableSetValue} from '../../../types.js'
 */

/**
 * Add affix to query
 * @private
 * @param {string} query
 * @param {string} prefix
 * @param {string} suffix
 */
function affixQuery (query, prefix, suffix) {
  if (prefix) {
    query = prefix + query
  }

  if (suffix) {
    const splitQuery = query.split('.')

    query = splitQuery[0] + suffix

    for (let i = 1; i < splitQuery.length; i++) {
      query = query + query
    }
  }

  return query
}

export const variable = createPlugin('variable', {
  metadata: {
    title: 'Variable',
    description: 'Management of variables',
    icon: 'mdi:variable-box'
  },
  state: {
    schema: {
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
    }
  },
  actions: {
    getValue: {
      metadata: {
        title: 'Get variable',
        description: 'Retrieve variable value',
        icon: 'mdi:application-variable'
      },
      parameters: {
        type: 'object',
        properties: {
          scope: {
            type: 'string'
          },
          prefixId: {
            type: 'string'
          },
          suffixId: {
            type: 'string'
          },
          query: {
            type: 'string',
            required: true
          }
        }
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
          const value = stateGetValue({
            name: 'variable/values',
            id: props.scope
          })

          if (!value.isEmpty) {
            const query = affixQuery(props.query, props.prefixId, props.suffixId)

            return getValue(value.item, query)
          }

          return
        }

        /** @TODO context.rootId must be present, we need to handle empty rootId */
        // get scopes
        const scopes = stateGetValue({
          name: 'variable/scopes',
          id: context.rootId
        })

        if (scopes.isEmpty) {
          return
        }

        for (let i = 0; i < scopes.item.length; i++) {
          // search for variable in scope
          const values = stateGetValue({
            name: 'variable/values',
            id: scopes[i]
          })

          if (!values.isEmpty) {
            const query = affixQuery(props.query, props.prefixId, props.suffixId)
            const value = getValue(values.item, query)

            if (value != null) {
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
        const newValues = {}
        const newValueKeys = []

        for (let i = 0; i < props.values.length; i++) {
          const item = props.values[i]
          let valueId = item.id || generateId()

          if (item.prefixId) {
            valueId = item.prefixId + valueId
          }

          if (item.suffixId) {
            valueId = valueId + item.suffixId
          }

          newValueKeys.push(valueId)
          newValues[valueId] = item.value
        }

        if (props.scope) {
          stateSetValue({
            name: 'component/belongsToScopes',
            value: props.scope,
            options: {
              id: context.id,
              update: {
                method: 'push'
              }
            }
          })

          return stateSetValue({
            name: 'variable/values',
            value: newValues,
            options: {
              id: props.scope,
              merge: true
            }
          })
        } else {
          const scope = stateGetValue({
            name: 'variable/scopes',
            id: context.rootId
          }).item

          // assign values to matching variables in parent scope
          for (let i = 0; i < scope.length; i++) {
            const id = scope[i]
            const values = stateGetValue({
              name: 'variable/values',
              id
            })

            if (!values.isEmpty) {
              let hasValue = false
              const value = {}

              for (let i = 0; i < newValueKeys.length; i++) {
                const key = newValueKeys[i]

                if (values.item.hasOwnProperty(key)) {
                  // set new value
                  hasValue = true
                  value[key] = newValues[key]
                  // remove used value
                  delete newValues[key]
                  newValueKeys.splice(i--, 1)
                }
              }

              if (hasValue) {
                stateSetValue({
                  name: 'variable/values',
                  value,
                  options: {
                    id,
                    merge: true
                  }
                })
              }

              // no values left to set
              if (!newValueKeys.length) {
                return
              }
            }
          }

          // assign value to current context
          if (newValueKeys.length) {
            stateSetValue({
              name: 'variable/values',
              value: newValues,
              options: {
                id: context.rootId,
                merge: true
              }
            })
          }
        }
      }
    }
  }
})

export const {
  variableGetValue,
  variableSetValue
} = variable

export default variable
