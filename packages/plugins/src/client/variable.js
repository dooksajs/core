import { createPlugin } from '@dooksa/create-plugin'
import { stateGetValue, stateSetValue } from '#client'
import { generateId, getValue } from '@dooksa/utils'

/**
 * @import {VariableGetValue, VariableSetValue} from '../../../types.js'
 */

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
  privateMethods: {
    /**
     * Add affix to query
     * @private
     * @param {string} query
     * @param {string} prefix
     * @param {string} suffix
     */
    affixQuery (query, prefix, suffix) {
      if (prefix) {
        query = prefix + query
      }

      if (suffix) {
        const splitQuery = query.split('.')

        query = splitQuery[0] + suffix

        for (let i = 1; i < splitQuery.length; i++) {
          query = query + '.' + splitQuery[i]
        }
      }

      return query
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
            const query = this.affixQuery(props.query, props.prefixId, props.suffixId)

            return getValue(value.item, query)
          }

          return
        }

        // get scopes - handle case where context.rootId might not be provided
        if (!context || !context.rootId) {
          return
        }

        const scopes = stateGetValue({
          name: 'variable/scopes',
          id: context.rootId
        })

        // Handle different return formats from mock state
        let scopeArray
        if (scopes.isEmpty) {
          return
        } else if (Array.isArray(scopes)) {
          scopeArray = scopes
        } else if (Array.isArray(scopes.item)) {
          scopeArray = scopes.item
        } else if (scopes.item && Array.isArray(scopes.item)) {
          scopeArray = scopes.item
        } else {
          return
        }

        for (let i = 0; i < scopeArray.length; i++) {
          // search for variable in scope
          const values = stateGetValue({
            name: 'variable/values',
            id: scopeArray[i]
          })

          // Handle different return formats for values
          let valueItem
          if (values.isEmpty) {
            continue
          } else if (values.item) {
            valueItem = values.item
          } else if (typeof values === 'object' && !values.isEmpty) {
            valueItem = values
          } else {
            continue
          }

          const query = this.affixQuery(props.query, props.prefixId, props.suffixId)
          const value = getValue(valueItem, query)

          if (value != null) {
            return value
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
          if (context.id) {
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
          }

          return stateSetValue({
            name: 'variable/values',
            value: newValues,
            options: {
              id: props.scope,
              merge: true
            }
          })
        } else {
          // Handle case where context.rootId might not be provided
          if (!context || !context.rootId) {
            return
          }

          const scopeResult = stateGetValue({
            name: 'variable/scopes',
            id: context.rootId
          })

          // Handle different return formats for scope result
          let scope
          if (scopeResult.isEmpty) {
            scope = null
          } else if (Array.isArray(scopeResult.item)) {
            scope = scopeResult.item
          } else if (Array.isArray(scopeResult)) {
            scope = scopeResult
          } else {
            scope = null
          }

          // assign values to matching variables in parent scope
          if (scope && scope.length) {
            for (let i = 0; i < scope.length; i++) {
              const id = scope[i]
              const values = stateGetValue({
                name: 'variable/values',
                id
              })

              // Handle different return formats for values
              let valueItem
              let isEmpty = true
              if (values.isEmpty) {
                continue
              } else if (values.item) {
                valueItem = values.item
                isEmpty = values.isEmpty
              } else if (typeof values === 'object' && !values.isEmpty) {
                valueItem = values
                isEmpty = false
              } else {
                continue
              }

              if (!isEmpty && valueItem) {
                let hasValue = false
                const value = {}

                for (let i = 0; i < newValueKeys.length; i++) {
                  const key = newValueKeys[i]

                  if (valueItem.hasOwnProperty(key)) {
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
