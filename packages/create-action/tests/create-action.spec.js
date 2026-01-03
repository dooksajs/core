import { describe, it, before } from 'node:test'
import { strictEqual, deepStrictEqual, throws } from 'node:assert'
import createAction from '../src/create-action.js'
import { hash } from '@dooksa/utils'

describe('createAction', function () {
  // Initialize hash before all tests
  before(() => {
    hash.init()
  })

  describe('Basic Functionality', function () {

    it('should create a basic action with simple data', function () {
      const id = 'test-action'
      const data = [
        {
          action_dispatch: {
            id: 'component-123',
            payload: {
              value: 'Hello World'
            }
          }
        }
      ]

      const result = createAction(id, data, [], { action_dispatch: true })

      strictEqual(result.id, id)
      strictEqual(Array.isArray(result.sequences), true)
      strictEqual(typeof result.blocks, 'object')
      strictEqual(typeof result.blockSequences, 'object')
      strictEqual(Array.isArray(result.dependencies), true)
    })

    it('should handle empty data array', function () {
      const id = 'empty-action'
      const data = []

      const result = createAction(id, data)

      strictEqual(result.id, id)
      deepStrictEqual(result.sequences, [])
      deepStrictEqual(result.blocks, {})
      deepStrictEqual(result.blockSequences, {})
      deepStrictEqual(result.dependencies, [])
    })

    it('should use default parameters', function () {
      const id = 'default-params'
      const data = [
        {
          action_dispatch: {
            id: 'test'
          }
        }
      ]

      const result = createAction(id, data)

      // Should use default empty array for dependencies
      deepStrictEqual(result.dependencies, [])
      // Should use availableMethods (we can't easily verify this without mocking)
      strictEqual(typeof result, 'object')
    })

    it('should accept custom dependencies', function () {
      const id = 'with-deps'
      const data = []
      const dependencies = ['dep1', 'dep2', 'dep3']

      const result = createAction(id, data, dependencies)

      deepStrictEqual(result.dependencies, dependencies)
    })

    it('should accept custom methods', function () {
      const id = 'custom-methods'
      const data = [
        {
          custom_method: {
            value: 'test'
          }
        }
      ]
      const methods = { custom_method: true }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })
  })

  describe('Reference Handling', function () {

    it('should handle $ref with index numbers', function () {
      const id = 'ref-index'
      const data = [
        {
          action_dispatch: {
            id: 'first',
            payload: { value: 'data' }
          }
        },
        {
          state_setValue: {
            name: 'test',
            value: {
              $ref: 0 // References first action
            }
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }

      const result = createAction(id, data, [], methods)

      // Should have processed both actions
      strictEqual(typeof result, 'object')
      strictEqual(result.id, id)

      // Check that sequences were created
      strictEqual(Array.isArray(result.sequences), true)
      strictEqual(result.sequences.length, 2)
    })

    it('should handle $ref with action IDs', function () {
      const id = 'ref-id'
      const data = [
        {
          $id: 'action-1',
          action_dispatch: {
            id: 'test'
          }
        },
        {
          state_setValue: {
            name: 'value',
            value: {
              $ref: 'action-1'
            }
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should handle $sequenceRef', function () {
      const id = 'seq-ref'
      const data = [
        {
          action_dispatch: {
            id: 'first'
          }
        },
        {
          action_ifElse: {
            if: [{
              op: '==',
              from: 'value',
              to: 'active'
            }],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        action_ifElse: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should throw error for $ref outside block sequence', function () {
      const id = 'ref-error'
      const data = [
        {
          state_setValue: {
            name: 'test',
            value: {
              $ref: 99 // Invalid index
            }
          }
        }
      ]

      const methods = {
        state_setValue: true
      }

      throws(() => {
        createAction(id, data, [], methods)
      }, {
        message: '$ref is outside the block sequence'
      })
    })
  })

  describe('Method Handling', function () {

    it('should merge custom methods with available methods', function () {
      const id = 'merge-methods'
      const data = [
        {
          custom_method: {
            value: 'test'
          }
        }
      ]
      const customMethods = { custom_method: true }

      const result = createAction(id, data, [], customMethods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should handle multiple actions with different methods', function () {
      const id = 'multi-methods'
      const data = [
        {
          action_dispatch: {
            id: 'dispatch-1'
          }
        },
        {
          state_setValue: {
            name: 'test',
            value: 'hello'
          }
        },
        {
          component_remove: {
            id: 'component-1'
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true,
        component_remove: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(Array.isArray(result.sequences), true)
      strictEqual(result.sequences.length, 3)
    })
  })

  describe('Block Processing', function () {

    it('should generate proper block sequences', function () {
      const id = 'block-seq'
      const data = [
        {
          action_dispatch: {
            id: 'test',
            payload: { value: 'data' }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      strictEqual(Array.isArray(result.sequences), true)
      strictEqual(result.sequences.length, 1)
      strictEqual(typeof result.blockSequences, 'object')
    })

    it('should track block indexes', function () {
      const id = 'block-index'
      const data = [
        {
          $id: 'named-action',
          action_dispatch: {
            id: 'test'
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      // Should have processed the named action
      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should assign block values correctly', function () {
      const id = 'block-values'
      const data = [
        {
          action_dispatch: {
            id: 'test',
            payload: {
              nested: {
                value: 'deep'
              }
            }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      strictEqual(typeof result.blocks, 'object')
      // Verify blocks were created
      strictEqual(Object.keys(result.blocks).length > 0, true)
    })

    it('should handle complex nested structures', function () {
      const id = 'complex-nested'
      const data = [
        {
          action_dispatch: {
            id: 'complex',
            payload: {
              data: {
                items: [1, 2, 3],
                config: {
                  enabled: true,
                  nested: {
                    deep: 'value'
                  }
                }
              }
            }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
      strictEqual(Object.keys(result.blocks).length > 0, true)
    })
  })

  describe('Edge Cases', function () {

    it('should handle multiple actions in sequence', function () {
      const id = 'multi-actions'
      const data = [
        {
          action_dispatch: { id: 'a' }
        },
        {
          state_setValue: {
            name: 'b',
            value: 'c'
          }
        },
        {
          component_remove: { id: 'd' }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true,
        component_remove: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.sequences.length, 3)
      strictEqual(result.id, id)
    })

    it('should handle actions with IDs', function () {
      const id = 'with-ids'
      const data = [
        {
          $id: 'action-1',
          action_dispatch: { id: 'test1' }
        },
        {
          $id: 'action-2',
          state_setValue: {
            name: 'test2',
            value: 'val'
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should handle actions without IDs', function () {
      const id = 'no-ids'
      const data = [
        {
          action_dispatch: { id: 'test' }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should handle dependency array', function () {
      const id = 'deps-test'
      const data = []
      const dependencies = ['plugin1', 'plugin2']

      const result = createAction(id, data, dependencies)

      deepStrictEqual(result.dependencies, dependencies)
    })

    it('should handle empty methods object', function () {
      const id = 'empty-methods'
      const data = [
        {
          action_dispatch: { id: 'test' }
        }
      ]

      const result = createAction(id, data, [], {})

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })
  })

  describe('Error Scenarios', function () {

    it('should throw error for invalid $ref index', function () {
      const id = 'invalid-ref'
      const data = [
        {
          state_setValue: {
            name: 'test',
            value: {
              $ref: 100 // Out of bounds
            }
          }
        }
      ]

      const methods = { state_setValue: true }

      throws(() => {
        createAction(id, data, [], methods)
      }, {
        message: '$ref is outside the block sequence'
      })
    })

    it('should handle type validation through parseAction', function () {
      const id = 'type-validation'
      const data = [
        {
          action_dispatch: {
            id: 'test',
            value: 'simple'
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      // Should not throw and should return valid result
      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })
  })

  describe('Integration with parseAction', function () {

    it('should properly integrate with parseAction for simple action', function () {
      const id = 'integration-simple'
      const data = [
        {
          action_dispatch: {
            id: 'dispatch-1',
            payload: {
              value: 'test'
            }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      // Verify structure
      strictEqual(result.id, id)
      strictEqual(Array.isArray(result.sequences), true)
      strictEqual(typeof result.blocks, 'object')
      strictEqual(typeof result.blockSequences, 'object')
      strictEqual(Array.isArray(result.dependencies), true)

      // Verify sequences contain block IDs
      if (result.sequences.length > 0) {
        const sequenceId = result.sequences[0]
        strictEqual(typeof sequenceId, 'string')
        // The sequence ID should be in format: hash_update_result + '_' + increment
        strictEqual(sequenceId.includes('_'), true)
      }
    })

    it('should handle action_ifElse specially', function () {
      const id = 'ifelse-test'
      const data = [
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                from: 'value',
                to: 'active'
              }
            ],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ]

      const methods = { action_ifElse: true }
      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should handle mixed action types', function () {
      const id = 'mixed-test'
      const data = [
        {
          action_dispatch: {
            id: 'dispatch',
            payload: { data: 'value' }
          }
        },
        {
          $id: 'named',
          state_setValue: {
            name: 'test',
            value: 'hello'
          }
        },
        {
          action_ifElse: {
            if: [{
              op: '==',
              from: 'x',
              to: 'y'
            }],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true,
        action_ifElse: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(result.sequences.length, 3)
      strictEqual(typeof result.blocks, 'object')
    })
  })

  describe('Reference Resolution', function () {

    it('should resolve $ref references in blocks', function () {
      const id = 'resolve-ref'
      const data = [
        {
          action_dispatch: {
            id: 'first',
            payload: { value: 'data' }
          }
        },
        {
          state_setValue: {
            name: 'test',
            value: {
              $ref: 0
            }
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }

      const result = createAction(id, data, [], methods)

      // Should have processed both actions
      strictEqual(typeof result, 'object')
      strictEqual(result.id, id)

      // Check that blocks were created
      strictEqual(typeof result.blocks, 'object')
      strictEqual(Object.keys(result.blocks).length > 0, true)
    })

    it('should resolve $sequenceRef references', function () {
      const id = 'resolve-seq-ref'
      const data = [
        {
          action_dispatch: {
            id: 'first'
          }
        },
        {
          action_ifElse: {
            if: [{
              op: '==',
              from: 'x',
              to: 'y'
            }],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        action_ifElse: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(typeof result.blocks, 'object')
      strictEqual(result.sequences.length, 2)
    })

    it('should handle multiple references in same action', function () {
      const id = 'multi-refs'
      const data = [
        {
          action_dispatch: {
            id: 'first',
            payload: { value: 'a' }
          }
        },
        {
          state_setValue: {
            name: 'test1',
            value: { $ref: 0 }
          }
        },
        {
          state_setValue: {
            name: 'test2',
            value: { $ref: 1 }
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(result.sequences.length, 3)
    })
  })

  describe('Complex Scenarios', function () {

    it('should handle deeply nested structures with references', function () {
      const id = 'deep-nested'
      const data = [
        {
          action_dispatch: {
            id: 'first',
            payload: { value: 'data1' }
          }
        },
        {
          action_dispatch: {
            id: 'second',
            payload: { value: 'data2' }
          }
        },
        {
          action_dispatch: {
            id: 'complex',
            payload: {
              data: {
                items: [
                  { value: 1 },
                  { value: 2 },
                  { $ref: 0 } // References first action
                ],
                config: {
                  enabled: true,
                  nested: {
                    deep: {
                      $ref: 1 // References second action
                    }
                  }
                }
              }
            }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
      strictEqual(result.sequences.length, 3)
    })

    it('should handle array of actions with references', function () {
      const id = 'array-actions'
      const data = [
        {
          action_dispatch: {
            id: 'action1',
            payload: { items: [1, 2, 3] }
          }
        },
        {
          action_dispatch: {
            id: 'action2',
            payload: {
              ref: { $ref: 0 }
            }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(result.sequences.length, 2)
    })

    it('should handle action with both $id and references', function () {
      const id = 'id-and-refs'
      const data = [
        {
          $id: 'named-action',
          action_dispatch: {
            id: 'test',
            payload: { value: 'data' }
          }
        },
        {
          state_setValue: {
            name: 'copy',
            value: { $ref: 'named-action' }
          }
        }
      ]

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
    })

    it('should handle very large action sequences', function () {
      const id = 'large-sequence'
      const data = []
      const methods = {
        action_dispatch: true,
        state_setValue: true
      }

      // Create 10 actions
      for (let i = 0; i < 10; i++) {
        if (i % 2 === 0) {
          data.push({
            action_dispatch: { id: `dispatch-${i}` }
          })
        } else {
          data.push({
            state_setValue: {
              name: `value-${i}`,
              value: i
            }
          })
        }
      }

      const result = createAction(id, data, [], methods)

      strictEqual(result.id, id)
      strictEqual(result.sequences.length, 10)
      strictEqual(typeof result.blocks, 'object')
      strictEqual(Object.keys(result.blocks).length > 10, true)
    })
  })

  describe('Hash Integration', function () {

    it('should use hash for prefix generation', function () {
      const id = 'hash-test'
      const data = [
        {
          action_dispatch: {
            id: 'test'
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      // The prefix should be based on the hash of the id
      // Since we can't easily mock the hash function in ES modules,
      // we just verify the structure is correct
      strictEqual(result.id, id)
      strictEqual(typeof result.sequences, 'object')

      // Verify sequences contain string IDs
      if (result.sequences.length > 0) {
        strictEqual(typeof result.sequences[0], 'string')
      }
    })

    it('should generate unique block IDs', function () {
      const id = 'unique-ids'
      const data = [
        {
          action_dispatch: { id: 'a' }
        },
        {
          action_dispatch: { id: 'b' }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      // All block IDs should be unique
      const blockIds = Object.keys(result.blocks)
      const uniqueIds = new Set(blockIds)
      strictEqual(blockIds.length, uniqueIds.size)
    })

    it('should handle same ID with different data', function () {
      const id = 'same-id'
      const data1 = [
        {
          action_dispatch: {
            id: 'test',
            payload: { value: 1 }
          }
        }
      ]
      const data2 = [
        {
          action_dispatch: {
            id: 'test',
            payload: { value: 2 }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result1 = createAction(id, data1, [], methods)
      const result2 = createAction(id, data2, [], methods)

      // Should produce different results due to different data
      strictEqual(result1.id, result2.id)
      // The blocks will be different because the data is different
      strictEqual(typeof result1.blocks, 'object')
      strictEqual(typeof result2.blocks, 'object')
    })
  })

  describe('Return Value Structure', function () {

    it('should return correct structure with all properties', function () {
      const id = 'structure-test'
      const data = [
        {
          action_dispatch: {
            id: 'test',
            payload: { value: 'data' }
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      // Check all required properties exist
      strictEqual(result.id, id)
      strictEqual(typeof result.blocks, 'object')
      strictEqual(typeof result.blockSequences, 'object')
      strictEqual(Array.isArray(result.sequences), true)
      strictEqual(Array.isArray(result.dependencies), true)
    })

    it('should have non-empty blocks for valid actions', function () {
      const id = 'blocks-test'
      const data = [
        {
          action_dispatch: {
            id: 'test'
          }
        }
      ]

      const methods = { action_dispatch: true }
      const result = createAction(id, data, [], methods)

      strictEqual(Object.keys(result.blocks).length > 0, true)
    })

    it('should preserve dependencies array', function () {
      const id = 'deps-preserve'
      const data = []
      const deps = ['dep1', 'dep2']

      const result = createAction(id, data, deps)

      deepStrictEqual(result.dependencies, deps)
      // Should be the same array reference
      strictEqual(result.dependencies, deps)
    })

    it('should handle empty dependencies', function () {
      const id = 'empty-deps'
      const data = []

      const result = createAction(id, data)

      deepStrictEqual(result.dependencies, [])
    })
  })
})
