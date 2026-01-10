import { createPlugin, mapState } from '@dooksa/create-plugin'
import { createAction, compileAction } from '@dooksa/create-action'
import { action as actionClient, stateSetValue } from '../client/index.js'
import { databaseSeed, databaseGetValue, databaseDeleteValue } from './database.js'
import { httpSetRoute } from './http.js'

/**
 * @typedef {Object} ActionSequenceResult
 * @property {Object.<string, number>} refs
 * @property {Action[]} [data]
 */

/**
 * @import {Action} from '@dooksa/create-action'
 * @import {Request, Response} from 'express'
 * @typedef {Object} ActionSequence
 * @property {Object} body
 * @property {ActionSequenceResult} body.sequence
 * @typedef {Request|ActionSequence} RequestAction
 */

export const action = createPlugin('action', {
  state: { ...mapState(actionClient) },
  methods: {
    /**
     * @param {RequestAction} request
     * @param {Response} response
     * @param {Function} next
     * @example
     * const body = {
     *  '[0]': true,
     *  '[1]a': true,
     *  '[1]b.c[0]': true,
     *  '[2]b.c[1]a': true,
     *  '[2]b.c[1]d': true,
     *  '[2]b.c[2]': true,
     *  '[3][0]': true,
     *  '[3][1]a': true
     * }
     * parseSequence({ body })
     */
    parseSequence (request, response, next) {
      /** @type {ActionSequenceResult} */
      const result = {
        refs: {}
      }
      const arrays = Object.create(null)
      let item

      for (const key in request.body) {
        if (Object.prototype.hasOwnProperty.call(request.body, key)) {
          // skip non array "[id]" key
          if (key[0] !== '[') {
            continue
          }

          const value = request.body[key]
          const lastIndex = key.length - 1
          let currentItem = item
          let prevItem
          let chars = ''
          let prevChars = ''
          let bracketIsOpen = false
          let depth = 0
          let indexDepth = ''
          let currentIndex = ''

          for (let i = 0; i < key.length; i++) {
            const char = key[i]

            if (char === '.') {
              // unexpected dot notation
              if (bracketIsOpen) {
                throw new Error('DooksaError: Expected a closing square bracket "]" but found "." at position "' + i + '" in key "' + key + '"')
              }

              // initialise object
              if (currentItem === undefined) {
                currentItem = Object.create(null)

                // prepare object for next key/value
                prevItem = currentItem
                currentItem[chars] = null
                currentItem = null

                // set property in new object
              } else if (currentItem === null &&
                typeof prevItem === 'object' &&
                Array.isArray(prevItem)
              ) {
                prevItem[prevChars] = Object.create(null)
                prevItem[prevChars][chars] = null
                prevItem = prevItem[prevChars]
                currentItem = null

                // append new object
              } else if (Array.isArray(currentItem)) {
                const object = Object.create(null)

                prevItem = currentItem
                currentItem.push(object)
                currentItem = object

                // set property to null in preparation for next key/value
              } else {
                prevItem = currentItem

                // prepare next key/value
                if (currentItem[chars] === undefined) {
                  currentItem[chars] = null
                }

                currentItem = currentItem[chars]
              }

              // reset chars
              prevChars = chars
              chars = ''
            } else if (char === '[') {
              bracketIsOpen = true
              indexDepth += depth++

              // add new object
              if (currentItem === null) {
                currentItem = Object.create(null)
                currentItem[chars] = null
                prevItem[prevChars] = currentItem
              }

              // reset chars
              prevChars = chars
              chars = ''
            } else if (char === ']') {
              // closing array
              let currentArray
              currentIndex += indexDepth + chars
              const array = arrays[currentIndex]
              bracketIsOpen = false

              if (!array || array[0][array[1]] == null) {
                if (currentItem && currentItem[prevChars] === null) {
                  // create new array
                  currentItem[prevChars] = []
                  currentItem = currentItem[prevChars]
                  currentArray = currentItem
                } else if (currentItem && Array.isArray(currentItem[prevChars])) {

                  currentItem = currentItem[prevChars]
                  currentArray = currentItem
                } else if (Array.isArray(prevItem) && Array.isArray(currentItem)) {
                  currentArray = currentItem
                } else if (!prevItem && item) {
                  if (depth > 1 && Array.isArray(currentItem)) {
                    currentArray = currentItem
                    currentItem = Object.create(null)
                    currentArray.push(currentItem)
                    prevItem = currentArray
                  } else {
                    if (key[i + 1] === '[') {
                      currentItem = []
                      prevItem = currentItem
                    } else {
                      currentItem = Object.create(null)
                    }

                    item.push(currentItem)
                    result.refs[chars] = item.length - 1
                    currentArray = item
                  }

                } else if (!item) {
                  // handle first results array item
                  currentItem = []
                  item = currentItem
                  currentArray = currentItem
                  result.data = item
                }

                arrays[currentIndex] = [currentArray, currentArray.length ? currentArray.length - 1 : 0]
              } else {
                currentItem = array[0][array[1]]
              }

              // reset chars
              prevChars = chars
              chars = ''
            } else {
              chars += char
            }

            // insert value
            if (lastIndex === i) {
              if (bracketIsOpen) {
                throw new Error('DooksaError: Expected a closing square bracket "]" but the last character is "' + char + '" in key "' + key + '"')
              }

              if (!prevItem) {
                // set key/value
                if (currentItem) {
                  // handle object property
                  if (typeof currentItem === 'object' && !Array.isArray(currentItem)) {
                    // missing key
                    if (!chars) {
                      throw new Error('DooksaError: Property has unexpected key "undefined"')
                    }

                    // missing property
                    if (currentItem[chars] != null) {
                      throw new Error('DooksaError: Property "' + chars + '" is not undefined (' + key + ')')
                    }

                    currentItem[chars] = value
                  } else if (Array.isArray(currentItem)) {
                    // handle adding value to array
                    if (chars) {
                      // add value to position
                      const index = arrays[currentIndex][1]
                      const item = currentItem[index]

                      if (!item) {
                        const entry = Object.create(null)
                        entry[chars] = value
                        currentItem[index] = entry
                      } else if (typeof item === 'object') {
                        currentItem[index][chars] = value
                      } else {
                        throw new Error('DooksaError: Cannot set new property on type "undefined"')
                      }
                    } else {
                      // append value
                      currentItem.push(value)
                    }
                  } else {
                    if (chars) {
                      throw new Error('DooksaError: Cannot assign property value to type "' + typeof currentItem + '"')
                    }
                  }
                } else {
                  result.data.push(value)
                }

                // add value to array
              } else if (Array.isArray(prevItem[prevChars])) {
                prevItem[prevChars].push(value)

                // create new object and set property
              } else if (prevItem[prevChars] === null) {
                prevItem[prevChars] = Object.create(null)
                prevItem[prevChars][chars] = value

                // set property
              } else if (typeof prevItem[prevChars] === 'object') {
                prevItem[prevChars][chars] = value

                // set value
              } else {
                currentItem = value
              }
            }
          }
        }
      }

      request.body.sequence = result

      next()
    },
    setAction (action) {
      const compiledAction = compileAction(action)

      stateSetValue({
        name: 'action/sequences',
        value: compiledAction.sequences,
        options: {
          id: action.id
        }
      })

      stateSetValue({
        name: 'action/blocks',
        value: compiledAction.blocks,
        options: {
          merge: true
        }
      })

      stateSetValue({
        name: 'action/blockSequences',
        value: compiledAction.blockSequences,
        options: {
          merge: true
        }
      })

      for (let i = 0; i < action.dependencies.length; i++) {
        stateSetValue({
          name: 'action/dependencies',
          value: action.dependencies[i],
          options: {
            id: action.id,
            update: {
              method: 'push'
            }
          }
        })
      }
    }
  },
  setup ({ actions }) {
    databaseSeed('action-blocks')
    databaseSeed('action-blockSequences')
    databaseSeed('action-sequences')

    if (Array.isArray(actions)) {
      for (let i = 0; i < actions.length; i++) {
        this.setAction(actions[i])
      }
    }

    // route: get a list of action sequence entries
    httpSetRoute({
      path: '/action/block-sequence',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [databaseGetValue(['action/blockSequences'])]
    })

    // route: delete action sequence entries
    httpSetRoute({
      path: '/action/block-sequence',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['action/blockSequences'])
      ]
    })

    // route: get a list of action
    httpSetRoute({
      path: '/action/sequence',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        databaseGetValue(['action/sequences'])
      ]
    })

    httpSetRoute({
      path: '/action/sequence',
      method: 'post',
      handlers: [
        this.parseSequence,
        /**
         * @import {DataWhere} from '../../../types.js'
         * @import {Request, Response} from 'express'
         */
        (request, response) => {
          const id = request.body['action-name']

          stateSetValue({
            name: 'action/templates',
            value: request.body,
            options: { id }
          })

          const action = createAction(id, request.body.sequence.data)

          this.setAction(action)

          response.status(201).send('created')
        }
      ]
    })

    // route: delete action sequence
    httpSetRoute({
      path: '/action/sequence',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['action/sequences'])
      ]
    })

    // route: get a list of action
    httpSetRoute({
      path: '/action/block',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        databaseGetValue(['action/blocks'])
      ]
    })

    // route: delete action
    httpSetRoute({
      path: '/action/block',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['action/blocks'])
      ]
    })
  }
})

export const { actionParseSequence, actionSetAction } = action

export default action
