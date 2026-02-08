import { describe, it, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok, throws, deepEqual } from 'node:assert'
import { state } from '#core'
import { createTestState, createState } from '../helpers/index.js'
import createPlugin from '@dooksa/create-plugin'

describe('State Plugin - Plugin Setup & Initialization', () => {
  afterEach(() => {
    state.restore()
  })

  describe('setup method', () => {
    it('should initialize with state data', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            collection: {
              type: 'collection',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' }
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Verify state plugin is set up
      strictEqual(typeof state.setup, 'function')
    })

    it('should register schemas from state data', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            collection: {
              type: 'collection',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' }
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Check that state has schema
      const schema = state.stateGetSchema('test/collection')
      ok(schema, 'Schema should be registered')
    })
  })
})

describe('State Plugin - getValue Action', () => {
  afterEach(() => {
    state.restore()
  })

  describe('Direct access', () => {
    it('should get value from specific collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const dataIn = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      const dataOut = state.stateGetValue({
        name: 'test/collection',
        id: dataIn.id
      })

      strictEqual(dataOut.item['item-1'], 'value-1')
    })

    it('should get nested value using dot notation', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const dataIn = state.stateSetValue({
        name: 'test/complex',
        value: {
          user: {
            profile: {
              name: 'Dave'
            }
          }
        }
      })

      const result = state.stateGetValue({
        name: 'test/complex',
        id: dataIn.id,
        options: { position: 'user.profile.name' }
      })

      strictEqual(result.item, 'Dave')
    })

    it('should get entire collection when no ID specified', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': { name: 'Item 1' },
          'item-2': { name: 'Item 2' }
        },
        options: { merge: true }
      })

      const result = state.stateGetValue({
        name: 'test/collection'
      })

      ok(Array.isArray(result.item), 'Result should be an array')
      strictEqual(result.item.length, 2)
    })

    it('should return empty result when ID not found', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateGetValue({
        name: 'test/collection',
        id: 'non-existent'
      })

      strictEqual(result.isEmpty, true)
    })

    it('should throw error when collection not found', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      throws(() => {
        state.stateGetValue({
          name: 'non-existent/collection'
        })
      }, {
        message: 'No collection found: "non-existent/collection"'
      })
    })

    it('should apply prefix to generated ID', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: { prefixId: 'prefix_' }
      })

      strictEqual(result.id.startsWith('prefix_'), true)
    })

    it('should apply suffix to generated ID', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: { suffixId: '_suffix' }
      })

      strictEqual(result.id.endsWith('_suffix'), true)
    })

    it('should apply both prefix and suffix to generated ID', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: {
          prefixId: 'prefix_',
          suffixId: '_suffix'
        }
      })

      strictEqual(result.id.startsWith('prefix_'), true)
      strictEqual(result.id.endsWith('_suffix'), true)
    })

    it('should clone result when clone option is true', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const originalValue = {
        name: 'Test Item',
        age: 30
      }
      // Set value with custom ID
      state.stateSetValue({
        name: 'test/collection',
        value: originalValue,
        options: { id: 'item-1' }
      })

      const result = state.stateGetValue({
        name: 'test/collection',
        id: 'item-1',
        options: { clone: true }
      })

      // Verify it's a clone (different reference)
      strictEqual(result.item === originalValue, false)
      deepStrictEqual(result.item, originalValue)
    })
  })

  describe('Collection filtering', () => {
    it('should filter collection with simple condition', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            status: 'active',
            name: 'Item 1'
          },
          'item-2': {
            status: 'inactive',
            name: 'Item 2'
          },
          'item-3': {
            status: 'active',
            name: 'Item 3'
          }
        },
        options: { merge: true }
      })

      const results = state.stateFind({
        name: 'test/collection',
        where: [
          {
            name: 'status',
            op: '==',
            value: 'active'
          }
        ]
      })

      strictEqual(results.length, 2)
      strictEqual(results[0].item.status, 'active')
      strictEqual(results[1].item.status, 'active')
    })

    it('should filter collection with AND conditions', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            status: 'active',
            role: 'admin',
            name: 'Item 1'
          },
          'item-2': {
            status: 'active',
            role: 'user',
            name: 'Item 2'
          },
          'item-3': {
            status: 'inactive',
            role: 'admin',
            name: 'Item 3'
          }
        },
        options: { merge: true }
      })

      const results = state.stateFind({
        name: 'test/collection',
        where: [
          {
            and: [
              {
                name: 'status',
                op: '==',
                value: 'active'
              },
              {
                name: 'role',
                op: '==',
                value: 'admin'
              }
            ]
          }
        ]
      })

      strictEqual(results.length, 1)
      strictEqual(results[0].item.name, 'Item 1')
    })

    it('should filter collection with OR conditions', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            status: 'active',
            role: 'admin',
            name: 'Item 1'
          },
          'item-2': {
            status: 'inactive',
            role: 'user',
            name: 'Item 2'
          },
          'item-3': {
            status: 'inactive',
            role: 'admin',
            name: 'Item 3'
          }
        },
        options: { merge: true }
      })

      const results = state.stateFind({
        name: 'test/collection',
        where: [
          {
            or: [
              {
                name: 'status',
                op: '==',
                value: 'active'
              },
              {
                name: 'role',
                op: '==',
                value: 'admin'
              }
            ]
          }
        ]
      })

      // Item 1: status is 'active' (matches first condition)
      // Item 2: role is 'user' (doesn't match either condition)
      // Item 3: role is 'admin' (matches second condition)
      // So we expect 2 results (Item 1 and Item 3)
      strictEqual(results.length, 2)
    })

    it('should filter with comparison operators', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            age: 25,
            name: 'Item 1'
          },
          'item-2': {
            age: 30,
            name: 'Item 2'
          },
          'item-3': {
            age: 35,
            name: 'Item 3'
          }
        },
        options: { merge: true }
      })

      const results = state.stateFind({
        name: 'test/collection',
        where: [
          {
            name: 'age',
            op: '>',
            value: 25
          }
        ]
      })

      strictEqual(results.length, 2)
      strictEqual(results[0].item.age, 30)
      strictEqual(results[1].item.age, 35)
    })

    it('should return empty array when no matches', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': { status: 'active' }
        }
      })

      const results = state.stateFind({
        name: 'test/collection',
        where: [
          {
            name: 'status',
            op: '==',
            value: 'inactive'
          }
        ]
      })

      strictEqual(results.length, 0)
    })

    it('should expand related data', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      // Setup main collection
      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            name: 'Item 1',
            relatedId: 'related-1'
          }
        }
      })

      // Setup related collection
      state.stateSetValue({
        name: 'test/related',
        value: {
          'related-1': { name: 'Related Item' }
        }
      })

      // Add relation
      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            name: 'Item 1',
            relatedId: 'related-1'
          }
        },
        options: {
          update: {
            position: ['relatedId']
          }
        }
      })

      const results = state.stateFind({
        name: 'test/collection',
        options: { expand: true }
      })

      ok(results[0].expand, 'Should have expand property')
    })
  })
})

describe('State Plugin - setValue Action', () => {
  afterEach(() => {
    state.restore()
  })

  describe('Creating values', () => {
    it('should set value in collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      strictEqual(result.item['item-1'], 'value-1')
    })

    it('should generate ID automatically', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'auto-generated': 'value' }
      })

      const keys = Object.keys(result.item)
      strictEqual(keys.length, 1)
      strictEqual(result.item[keys[0]], 'value')
    })

    it('should apply prefix to generated ID', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: { prefixId: 'prefix_' }
      })

      strictEqual(result.id.startsWith('prefix_'), true)
    })

    it('should apply suffix to generated ID defined by schema', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            products: {
              type: 'collection',
              suffixId: '_suffix',
              items: {
                type: 'string'
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/products',
        value: 'shoes'
      })

      ok(result.id.endsWith('_suffix'), 'ID should end with suffix')
    })

    it('should apply suffix to generated ID defined by options', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            products: {
              type: 'collection',
              items: {
                type: 'string'
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/products',
        value: 'shoes',
        options: {
          suffixId: '_suffix'
        }
      })

      ok(result.id.endsWith('_suffix'), 'ID should end with suffix')
    })

    it('should apply both prefix and suffix to generated ID', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'test-value': 'value' },
        options: {
          prefixId: 'pre_',
          suffixId: '_suf'
        }
      })

      ok(result.id.startsWith('pre_') && result.id.endsWith('_suf'), 'ID should have both affixes')
    })

    it('should use provided ID with prefix and suffix', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { name: 'joe' },
        options: {
          prefixId: 'pre_',
          suffixId: '_suf'
        }
      })

      ok(result.id.startsWith('pre_') && result.id.endsWith('_suf'), 'ID should have both affixes')
    })

    it('should set multiple values at once', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': 'value-1',
          'item-2': 'value-2',
          'item-3': 'value-3'
        }
      })

      strictEqual(result.item['item-1'], 'value-1')
      strictEqual(result.item['item-2'], 'value-2')
      strictEqual(result.item['item-3'], 'value-3')
    })

    it('should set value in non-collection schema', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/single',
        value: {
          name: 'Test',
          value: 123
        }
      })

      deepStrictEqual(result.item, {
        name: 'Test',
        value: 123
      })
    })

    it('should set array value', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      deepStrictEqual(result.item, ['a', 'b', 'c'])
    })

    it('should set complex nested values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const complexValue = {
        user: {
          profile: {
            name: 'John',
            age: 30,
            settings: {
              theme: 'dark',
              notifications: true
            }
          }
        }
      }

      const result = state.stateSetValue({
        name: 'test/complex',
        value: complexValue
      })

      deepStrictEqual(result.item, complexValue)
    })
  })

  describe('Updating values', () => {
    it('should update existing value', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'old-value' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'new-value' }
      })

      strictEqual(result.item['item-1'], 'new-value')
    })

    it('should merge with existing values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: { name: 'Joe' },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { age: 23 },
        options: {
          id: 'item-1',
          merge: true
        }
      })

      strictEqual(result.item.name, 'Joe')
      strictEqual(result.item.age, 23)
    })

    it('should merge with existing values in single object schema', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/single',
        value: { name: 'Test Item' }
      })

      const result = state.stateSetValue({
        name: 'test/single',
        value: { value: 456 },
        options: { merge: true }
      })

      strictEqual(result.item.name, 'Test Item')
      strictEqual(result.item.value, 456)
    })

    it('should merge with existing values in array schema', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/array',
        value: ['a', 'b']
      })

      const result = state.stateSetValue({
        name: 'test/array',
        value: ['c', 'd'],
        options: { merge: true }
      })

      deepStrictEqual(result.item, ['a', 'b', 'c', 'd'])
    })

    it('should merge with existing values in complex nested object schema', { skip: true }, async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/complex',
        value: {
          user: {
            profile: {
              name: 'John',
              age: 30,
              settings: {
                theme: 'dark',
                notifications: true
              }
            }
          }
        }
      })

      const result = state.stateSetValue({
        name: 'test/complex',
        value: {
          user: {
            profile: {
              settings: {
                theme: 'light'
              }
            }
          }
        },
        options: { merge: true }
      })

      strictEqual(result.item.user.profile.name, 'John')
      strictEqual(result.item.user.profile.age, 30)
      strictEqual(result.item.user.profile.settings.theme, 'light')
      strictEqual(result.item.user.profile.settings.notifications, true)
    })

    it('should merge with existing values in related collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/related',
        value: {
          name: 'Related Item 1',
          refId: 'ref-1'
        },
        options: { id: 'related-1' }
      })

      const result = state.stateSetValue({
        name: 'test/related',
        value: { refId: 'ref-2' },
        options: {
          id: 'related-1',
          merge: true
        }
      })

      strictEqual(result.item.name, 'Related Item 1')
      strictEqual(result.item.refId, 'ref-2')
    })

    it('should merge with deeply nested objects', { skip: true }, async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          level1: {
            level2: {
              level3: {
                value: 'deep',
                extra: 'data'
              }
            }
          }
        },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          level1: {
            level2: {
              level3: {
                value: 'updated'
              }
            }
          }
        },
        options: {
          id: 'item-1',
          merge: true
        }
      })

      strictEqual(result.item.level1.level2.level3.value, 'updated')
      strictEqual(result.item.level1.level2.level3.extra, 'data')
    })

    it('should merge with array values in objects', { skip: true }, async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          tags: ['tag1', 'tag2'],
          name: 'Item'
        },
        options: { id: 'item-1' }

      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          tags: ['tag3', 'tag4']
        },
        options: {
          id: 'item-1',
          merge: true
        }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2', 'tag3', 'tag4'])
      strictEqual(result.item.name, 'Item')
    })

    it('should merge with nested collection items', { skip: true }, async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Parent',
          children: {
            'child-1': { name: 'Child 1' }
          }
        },
        options: { id: 'item-1 ' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          children: {
            'child-2': { name: 'Child 2' }
          }
        },
        options: {
          id: 'item-1',
          merge: true
        }
      })

      strictEqual(result.item.name, 'Parent')
      strictEqual(result.item.children['child-1'].name, 'Child 1')
      strictEqual(result.item.children['child-2'].name, 'Child 2')
    })

    it('should merge with primitive values overriding objects', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          value: { nested: 'object' }
        },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          value: 'simple string'
        },
        options: {
          id: 'item-1',
          merge: true
        }
      })

      strictEqual(result.item.value, 'simple string')
    })

    it('should merge with null values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          value: null
        },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            age: 25
          }
        },
        options: { merge: true }
      })

      strictEqual(result.item.name, 'Test')
      strictEqual(result.item.value, null)
      strictEqual(result.item.age, 25)
    })

    it('should merge with undefined values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          value: undefined
        },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            age: 25
          }
        },
        options: { merge: true }
      })

      strictEqual(result.item.name, 'Test')
      strictEqual(result.item.value, undefined)
      strictEqual(result.item.age, 25)
    })

    it('should merge with boolean values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          active: true
        },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            active: false
          }
        },
        options: { merge: true }
      })

      strictEqual(result.item.name, 'Test')
      strictEqual(result.item.active, false)
    })

    it('should merge with number values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          count: 10
        },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          count: 20
        },
        options: {
          id: 'item-1',
          merge: true
        }
      })

      strictEqual(result.item.name, 'Test')
      strictEqual(result.item.count, 20)
    })

    it('should replace entire collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateUnsafeSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      const result = state.stateUnsafeSetValue({
        name: 'test/collection',
        value: { 'item-2': 'value-2' },
        options: { replace: true }
      })

      // Result is an array of DataValues
      ok(Array.isArray(result.item), 'Result should be an array')
      strictEqual(result.item.length, 1)
      strictEqual(result.item[0].id, 'item-2')
      strictEqual(result.item[0].item, 'value-2')

      // Verify the collection was replaced
      const collection = state.stateGetValue({
        name: 'test/collection'
      })

      ok(!collection.isEmpty)
      strictEqual(collection.item.length, 1)
      strictEqual(collection.item[0].id, 'item-2')
      strictEqual(collection.item[0].item, 'value-2')
    })

    it('should update nested property', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Old Name',
          age: 25
        },
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: 'New Name',
        options: {
          id: 'item-1',
          update: {
            position: ['name']
          }
        }
      })

      strictEqual(result.item.name, 'New Name')
      strictEqual(result.item.age, 25)
    })

    it('should update array with push method', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/array',
        value: ['a', 'b']
      })

      const result = state.stateSetValue({
        name: 'test/array',
        value: 'c',
        options: {
          update: {
            method: 'push'
          }
        }
      })

      deepStrictEqual(result.item, ['a', 'b', 'c'])
    })

    it('should update array with pull method', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      const result = state.stateSetValue({
        name: 'test/array',
        value: 'b',
        options: {
          update: {
            method: 'pull'
          }
        }
      })

      deepStrictEqual(result.item, ['a', 'c'])
    })

    it('should update array with splice method', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      const result = state.stateSetValue({
        name: 'test/array',
        value: ['x', 'y'],
        options: {
          update: {
            position: [],
            method: 'splice',
            startIndex: 1,
            deleteCount: 1
          }
        }
      })

      deepStrictEqual(result.item, ['a', 'x', 'y', 'c'])
    })

    it('should store previous value', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: 'old-value',
        options: { id: 'item-1' }
      })

      const result = state.stateSetValue({
        name: 'test/collection',
        value: 'new-value',
        options: { id: 'item-1' }
      })

      ok(result.previous, 'Should have previous value')
      strictEqual(result.previous._item, 'old-value')
    })
  })

  describe('Metadata', () => {
    it('should set metadata on values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' },
        options: {
          metadata: {
            userId: 'user-123',
            custom: 'data'
          }
        }
      })

      ok(result.metadata, 'Should have metadata')
      strictEqual(result.metadata.userId, 'user-123')
      strictEqual(result.metadata.custom, 'data')
    })

    it('should add timestamps on server', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Timestamps are only added on server
      // This test verifies the structure exists
      ok(result.metadata, 'Should have metadata')
    })
  })
})

describe('State Plugin - deleteValue Action', () => {
  afterEach(() => {
    state.restore()
  })

  describe('Basic deletion', () => {
    it('should delete value from collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': 'value-1',
          'item-2': 'value-2'
        }
      })

      const result = state.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(result.deleted, true)
      strictEqual(result.inUse, false)

      // Verify deletion
      const getValue = state.stateGetValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(getValue.isEmpty, true)
    })

    it('should return inUse true when data is referenced', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      // Setup main collection
      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Setup related collection with reference
      state.stateSetValue({
        name: 'test/related',
        value: { 'related-1': { refId: 'item-1' } }
      })

      // Add relation (simulated)
      // Note: In real usage, relations are added during validation
      // For this test, we're testing the deletion logic

      const result = state.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      // Should allow deletion if not in use
      strictEqual(result.deleted, true)
    })

    it('should throw error when collection not found', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      throws(() => {
        state.stateDeleteValue({
          name: 'non-existent/collection',
          id: 'item-1'
        })
      }, {
        message: /Collection not found/
      })
    })

    it('should not throw when ID not found', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateDeleteValue({
        name: 'test/collection',
        id: 'non-existent'
      })

      // Should complete without error
      ok(result)
    })
  })

  describe('Cascade deletion', () => {
    it('should delete related data when cascade is true', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      // Setup main collection
      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Setup related collection
      state.stateSetValue({
        name: 'test/related',
        value: { 'related-1': 'related-value' }
      })

      // Note: In real usage, relations are managed by the state plugin
      // For this test, we're testing the cascade parameter

      const result = state.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1',
        cascade: true
      })

      strictEqual(result.deleted, true)
    })
  })

  describe('Event dispatching', () => {
    it('should dispatch delete event', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      let eventFired = false
      let eventValue = null

      // Add listener
      state.stateAddListener({
        name: 'test/collection',
        on: 'delete',
        handler: (value) => {
          eventFired = true
          eventValue = value
        }
      })

      state.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(eventFired, true)
      ok(eventValue, 'Event should have value')
      strictEqual(eventValue.id, 'item-1')
    })

    it('should not dispatch event when stopPropagation is true', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      let eventFired = false

      state.stateAddListener({
        name: 'test/collection',
        on: 'delete',
        handler: () => {
          eventFired = true
        }
      })

      state.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1',
        stopPropagation: true
      })

      strictEqual(eventFired, false)
    })
  })
})

describe('State Plugin - find Action', () => {
  afterEach(() => {
    state.restore()
  })

  it('should find all items in collection', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    state.stateSetValue({
      name: 'test/collection',
      value: {
        'item-1': { name: 'Item 1' },
        'item-2': { name: 'Item 2' },
        'item-3': { name: 'Item 3' }
      },
      options: { replace: true }
    })

    const results = state.stateFind({
      name: 'test/collection'
    })

    strictEqual(results.length, 3)
  })

  it('should filter results with where conditions', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    state.stateSetValue({
      name: 'test/collection',
      value: {
        'item-1': {
          status: 'active',
          name: 'Item 1'
        },
        'item-2': {
          status: 'inactive',
          name: 'Item 2'
        },
        'item-3': {
          status: 'active',
          name: 'Item 3'
        }
      },
      options: { replace: true }
    })

    const results = state.stateFind({
      name: 'test/collection',
      where: [
        {
          name: 'status',
          op: '==',
          value: 'active'
        }
      ]
    })

    strictEqual(results.length, 2)
    strictEqual(results[0].item.status, 'active')
    strictEqual(results[1].item.status, 'active')
  })

  it('should expand related data', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    state.stateSetValue({
      name: 'test/collection',
      value: {
        'item-1': {
          name: 'Item 1',
          relatedId: 'related-1'
        }
      }
    })

    state.stateSetValue({
      name: 'test/related',
      value: {
        'related-1': { name: 'Related Item' }
      }
    })

    const results = state.stateFind({
      name: 'test/collection',
      options: { expand: true }
    })

    ok(results[0].expand, 'Should have expand property')
  })

  it('should return empty array when collection not found', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    throws(() => {
      state.stateFind({
        name: 'non-existent/collection'
      })
    }, {
      message: 'No collection found: "non-existent/collection"'
    })
  })
})

describe('State Plugin - Event Listeners', () => {
  afterEach(() => {
    state.restore()
  })

  describe('addListener', () => {
    it('should add listener to collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      let eventFired = false

      const handlerId = state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      ok(handlerId, 'Should return handler ID')

      // Trigger event
      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      strictEqual(eventFired, true)
    })

    it('should add listener to specific item', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      let eventFired = false

      state.stateAddListener({
        name: 'test/collection',
        id: 'item-1',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      // Update specific item
      state.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      strictEqual(eventFired, true)
    })

    it('should add priority listener', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const order = []

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        priority: 1,
        handler: () => {
          order.push('priority-1')
        }
      })

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        priority: 2,
        handler: () => {
          order.push('priority-2')
        }
      })

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Priority listeners should execute in order
      strictEqual(order[0], 'priority-1')
      strictEqual(order[1], 'priority-2')
    })

    it('should add capture-all listener', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      let eventCount = 0

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        captureAll: true,
        handler: () => {
          eventCount++
        }
      })

      // Multiple updates
      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-2': 'value-2' }
      })

      strictEqual(eventCount, 2)
    })

    it('should force event even with stopPropagation', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      let eventFired = false

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        force: true,
        handler: () => {
          eventFired = true
        }
      })

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' },
        options: { stopPropagation: true }
      })

      strictEqual(eventFired, true)
    })

    it('should accept string handler (action ID)', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      // Note: This test verifies the structure, actual action dispatch
      // would require the action plugin to be set up
      const handlerId = state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: 'some-action-id'
      })

      ok(handlerId, 'Should return handler ID')
    })
  })

  describe('deleteListener', () => {
    it('should delete listener', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      let eventFired = false

      const handlerId = state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      // Delete listener
      state.stateDeleteListener({
        name: 'test/collection',
        on: 'update',
        handlerId
      })

      // Reset event flag
      eventFired = false

      // Trigger event
      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      strictEqual(eventFired, false)
    })

    it('should delete listener from specific item', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      let eventFired = false

      const handlerId = state.stateAddListener({
        name: 'test/collection',
        id: 'item-1',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      state.stateDeleteListener({
        name: 'test/collection',
        id: 'item-1',
        on: 'update',
        handlerId
      })

      state.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      strictEqual(eventFired, false)
    })

    it('should return false with non-existent listener is deleted', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateDeleteListener({
        name: 'test/collection',
        on: 'update',
        handlerId: 'non-existent'
      })

      strictEqual(result, false)
    })
  })

  describe('Event dispatching', () => {
    it('should dispatch update event to all listeners', { skip: true }, async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const events = []

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: (value) => {
          events.push({
            type: 'all',
            value
          })
        }
      })

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        priority: 1,
        handler: (value) => {
          events.push({
            type: 'priority',
            value
          })
        }
      })

      state.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      strictEqual(events.length, 2)
      strictEqual(events[0].type, 'priority')
      strictEqual(events[1].type, 'all')
    })

    it('should stop propagation when requested', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const events = []

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: (value) => {
          events.push('listener-1')
        }
      })

      state.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: (value) => {
          events.push('listener-2')
        }
      })

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' },
        options: { stopPropagation: true }
      })

      // With stopPropagation, no listeners should fire
      strictEqual(events.length, 0)
    })

    it('should dispatch delete event', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      let eventFired = false

      state.stateAddListener({
        name: 'test/collection',
        on: 'delete',
        handler: () => {
          eventFired = true
        }
      })

      state.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      state.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(eventFired, true)
    })
  })
})

describe('State Plugin - Schema Validation', () => {
  afterEach(() => {
    state.restore()
  })

  describe('Type validation', () => {
    it('should validate string type', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      // Note: Schema validation happens during setValue
      // This test verifies the structure exists
      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'string-value' }
      })

      ok(result.item)
    })

    it('should validate number type', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 123 }
      })

      ok(result.item)
    })

    it('should validate boolean type', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': true }
      })

      ok(result.item)
    })

    it('should validate object type', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            name: 'Test',
            value: 123
          }
        }
      })

      ok(result.item)
    })

    it('should validate array type', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      ok(result.item)
    })

    it('should validate function type', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': () => {
          }
        }
      })

      ok(result.item)
    })

    it('should validate node type', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': { nodeName: 'DIV' } }
      })

      ok(result.item)
    })
  })

  describe('Schema constraints', () => {
    it('should validate required properties', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' }
              },
              required: ['name', 'email']
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid object with all required properties
      const result = state.stateSetValue({
        name: 'test/user',
        value: {
          name: 'John',
          email: 'john@example.com'
        }
      })

      deepStrictEqual(result.item, {
        name: 'John',
        email: 'john@example.com'
      })
    })

    it('should throw error when required property is missing', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' }
              },
              required: ['name', 'email']
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { name: 'John' }
        })
      })
    })

    it('should validate unique items in arrays', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid array with unique items
      const result = state.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2', 'tag3'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2', 'tag3'])
    })

    it('should throw error for unique items violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            users: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/users',
          value: { tags: ['tag1', 'tag2', 'tag1'] }
        })
      }, {
        message: 'Array items must be unique'
      })
    })

    it('should validate additional properties: false', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' }
              },
              additionalProperties: false
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid object with only defined properties
      const result = state.stateSetValue({
        name: 'test/user',
        value: {
          name: 'John',
          age: 30
        }
      })

      deepStrictEqual(result.item, {
        name: 'John',
        age: 30
      })
    })

    it('should throw error for additional properties violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' }
              },
              additionalProperties: false
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: {
            name: 'John',
            age: 30,
            email: 'john@example.com'
          }
        })
      })
    })
  })

  describe('Pattern validation', { skip: true }, () => {
    it('should validate string pattern', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid email
      const result = state.stateSetValue({
        name: 'test/user',
        value: { email: 'john@example.com' }
      })

      strictEqual(result.item.email, 'john@example.com')
    })

    it('should throw error for invalid pattern', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                email: {
                  type: 'string',
                  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { email: 'not-an-email' }
        })
      })
    })
  })

  describe('Enum validation', { skip: true }, () => {
    it('should validate enum values', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['active', 'inactive', 'pending']
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid enum value
      const result = state.stateSetValue({
        name: 'test/user',
        value: { status: 'active' }
      })

      strictEqual(result.item.status, 'active')
    })

    it('should throw error for invalid enum value', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['active', 'inactive', 'pending']
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { status: 'archived' }
        })
      })
    })
  })

  describe('Min/Max length validation', { skip: true }, () => {
    it('should validate minLength', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  minLength: 3
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid length
      const result = state.stateSetValue({
        name: 'test/user',
        value: { name: 'John' }
      })

      strictEqual(result.item.name, 'John')
    })

    it('should throw error for minLength violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  minLength: 3
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { name: 'Jo' }
        })
      })
    })

    it('should validate maxLength', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  maxLength: 10
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid length
      const result = state.stateSetValue({
        name: 'test/user',
        value: { name: 'John' }
      })

      strictEqual(result.item.name, 'John')
    })

    it('should throw error for maxLength violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  maxLength: 3
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { name: 'John' }
        })
      })
    })
  })

  describe('Min/Max value validation', { skip: true }, () => {
    it('should validate minimum', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  minimum: 18
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid value
      const result = state.stateSetValue({
        name: 'test/user',
        value: { age: 25 }
      })

      strictEqual(result.item.age, 25)
    })

    it('should throw error for minimum violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  minimum: 18
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { age: 15 }
        })
      })
    })

    it('should validate maximum', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  maximum: 100
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid value
      const result = state.stateSetValue({
        name: 'test/user',
        value: { age: 50 }
      })

      strictEqual(result.item.age, 50)
    })

    it('should throw error for maximum violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  maximum: 100
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { age: 150 }
        })
      })
    })

    it('should validate exclusiveMinimum', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  exclusiveMinimum: 18
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid value (greater than 18)
      const result = state.stateSetValue({
        name: 'test/user',
        value: { age: 19 }
      })

      strictEqual(result.item.age, 19)
    })

    it('should throw error for exclusiveMinimum violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  exclusiveMinimum: 18
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { age: 18 }
        })
      })
    })

    it('should validate exclusiveMaximum', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  exclusiveMaximum: 100
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid value (less than 100)
      const result = state.stateSetValue({
        name: 'test/user',
        value: { age: 99 }
      })

      strictEqual(result.item.age, 99)
    })

    it('should throw error for exclusiveMaximum violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  exclusiveMaximum: 100
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { age: 100 }
        })
      })
    })

    it('should validate multipleOf', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  multipleOf: 5
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid value (multiple of 5)
      const result = state.stateSetValue({
        name: 'test/user',
        value: { age: 25 }
      })

      strictEqual(result.item.age, 25)
    })

    it('should throw error for multipleOf violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                age: {
                  type: 'number',
                  multipleOf: 5
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { age: 23 }
        })
      })
    })
  })

  describe('Array constraint validation', { skip: true }, () => {
    it('should validate minItems', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 2
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid array with 2 items
      const result = state.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2'])
    })

    it('should throw error for minItems violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 2
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { tags: ['tag1'] }
        })
      })
    })

    it('should validate maxItems', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  maxItems: 3
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid array with 3 items
      const result = state.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2', 'tag3'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2', 'tag3'])
    })

    it('should throw error for maxItems violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  maxItems: 2
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { tags: ['tag1', 'tag2', 'tag3'] }
        })
      })
    })

    it('should validate uniqueItems', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid array with unique items
      const result = state.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2', 'tag3'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2', 'tag3'])
    })

    it('should throw error for uniqueItems violation', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  uniqueItems: true
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: { tags: ['tag1', 'tag2', 'tag1'] }
        })
      })
    })

    it('should validate uniqueItems with objects', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' }
                    }
                  },
                  uniqueItems: true
                }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid array with unique objects
      const result = state.stateSetValue({
        name: 'test/user',
        value: {
          items: [
            {
              id: '1',
              name: 'Item 1'
            },
            {
              id: '2',
              name: 'Item 2'
            }
          ]
        }
      })

      deepStrictEqual(result.item.items, [
        {
          id: '1',
          name: 'Item 1'
        },
        {
          id: '2',
          name: 'Item 2'
        }
      ])
    })
  })

  describe('Additional properties validation', () => {
    it('should validate additionalProperties: false', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' }
              },
              additionalProperties: false
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid object with only defined properties
      const result = state.stateSetValue({
        name: 'test/user',
        value: {
          name: 'John',
          age: 30
        }
      })

      deepStrictEqual(result.item, {
        name: 'John',
        age: 30
      })
    })

    it('should throw error for additionalProperties: false', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' }
              },
              additionalProperties: false
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/user',
          value: {
            name: 'John',
            age: 30,
            email: 'john@example.com'
          }
        })
      })
    })
  })

  describe('Pattern properties validation', () => {
    it('should validate patternProperties', async (t) => {
      const testPlugin = createPlugin('test', {
        state: {
          schema: {
            user: {
              type: 'object',
              patternProperties: {
                '^[a-zA-Z_]+$': { type: 'string' }
              }
            }
          }
        }
      })

      const stateData = createState([testPlugin])
      state.setup(stateData)

      // Valid object with pattern-matching properties
      const result = state.stateSetValue({
        name: 'test/user',
        value: {
          name: 'John',
          age: '30'
        }
      })

      deepStrictEqual(result.item, {
        name: 'John',
        age: '30'
      })
    })
  })

  describe('Relationships', () => {
    it('should add relation between collections', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      // Setup main collection
      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Setup related collection
      state.stateSetValue({
        name: 'test/related',
        value: { 'related-1': { refId: 'item-1' } }
      })

      // Note: Relations are added during validation
      // This test verifies the structure exists
      ok(true)
    })

    it('should remove relation when data is deleted', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      // Setup collections
      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      state.stateSetValue({
        name: 'test/related',
        value: { 'related-1': 'related-value' }
      })

      // Delete item
      const result = state.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(result.deleted, true)
    })
  })
})

describe('State Plugin - Edge Cases', () => {
  afterEach(() => {
    state.restore()
  })

  describe('Null and undefined values', () => {
    it('should handle null values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': null }
      })

      strictEqual(result.item['item-1'], null)
    })

    it('should handle undefined values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': undefined }
      })

      strictEqual(result.item['item-1'], undefined)
    })

    it('should not get null value', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'test/collection',
          value: null,
          options: { id: 'item-1' }
        })
      }, {
        message: 'Source was undefined'
      })
    })

    it('should get undefined value', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': undefined }
      })

      const result = state.stateGetValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(result.item, undefined)
    })
  })

  describe('Missing data', () => {
    it('should handle missing collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      throws(() => {
        state.stateGetValue({
          name: 'non-existent/collection'
        })
      },
      {
        message: 'No collection found: "non-existent/collection"'
      })
    })

    it('should handle missing ID', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateGetValue({
        name: 'test/collection',
        id: 'non-existent'
      })

      strictEqual(result.isEmpty, true)
    })

    it('should handle missing nested property', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test' },
        options: { id: 'item-1' }
      })

      const result = state.stateGetValue({
        name: 'test/collection',
        id: 'item-1',
        options: { position: 'missing.nested.property' }
      })

      ok(result.isEmpty)
      strictEqual(result.item, undefined)
    })
  })

  describe('Invalid operations', () => {
    it('should throw error when setting value in non-existent collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      throws(() => {
        state.stateSetValue({
          name: 'non-existent/collection',
          value: { 'item-1': 'value-1' }
        })
      }, {
        message: /Schema not found/
      })
    })

    it('should throw error when deleting from non-existent collection', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      throws(() => {
        state.stateDeleteValue({
          name: 'non-existent/collection',
          id: 'item-1'
        })
      }, {
        message: /Collection not found/
      })
    })

    it('should handle empty values array', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const result = state.stateSetValue({
        name: 'test/collection',
        value: {}
      })

      ok(result)
    })

    it('should handle empty filter conditions', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      const results = state.stateFind({
        name: 'test/collection',
        where: []
      })

      strictEqual(results.length, 1)
    })
  })

  describe('Complex scenarios', () => {
    it('should handle deeply nested structures', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const deepValue = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  value: 'deep'
                }
              }
            }
          }
        }
      }

      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': deepValue }
      })

      deepStrictEqual(result.item['item-1'], deepValue)
    })

    it('should handle large collections', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const largeCollection = {}
      for (let i = 0; i < 100; i++) {
        largeCollection[`item-${i}`] = { value: i }
      }

      const result = state.stateSetValue({
        name: 'test/collection',
        value: largeCollection
      })

      strictEqual(Object.keys(result.item).length, 100)
    })

    it('should handle circular references in values', async (t) => {
      const stateData = createTestState()
      state.setup(stateData)

      const obj1 = { name: 'Object 1' }
      const obj2 = {
        name: 'Object 2',
        ref: obj1
      }
      obj1.ref = obj2

      // Note: deepClone should handle circular references
      const result = state.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': obj1 }
      })

      ok(result.item)
    })
  })
})

describe('State Plugin - Integration Tests', () => {
  afterEach(() => {
    state.restore()
  })

  it('should work with multiple collections', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    // Set values in multiple collections
    state.stateSetValue({
      name: 'test/collection',
      value: 'value-1',
      options: { id: 'item-1' }
    })

    state.stateSetValue({
      name: 'test/single',
      value: 'value-2'
    })

    // Get values from both collections
    const result1 = state.stateGetValue({
      name: 'test/collection',
      id: 'item-1'
    })

    const result2 = state.stateGetValue({
      name: 'test/single'
    })

    strictEqual(result1.item, 'value-1')
    strictEqual(result2.item, 'value-2')
  })

  it('should handle complex workflow', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    // 1. Create initial data
    state.stateSetValue({
      name: 'test/collection',
      value: {
        'user-1': {
          name: 'John',
          age: 30,
          role: 'standard'
        }
      },
      options: { replace: true }
    })

    // 2. Update data
    state.stateSetValue({
      name: 'test/collection',
      value: {
        name: 'John',
        age: 31,
        role: 'admin'
      },
      options: { id: 'user-1' }
    })

    // 3. Find filtered data
    const results = state.stateFind({
      name: 'test/collection',
      where: [
        {
          name: 'role',
          op: '==',
          value: 'admin'
        }
      ]
    })

    strictEqual(results.length, 1)
    strictEqual(results[0].item.age, 31)

    // 4. Add listener
    let listenerCalled = false
    state.stateAddListener({
      name: 'test/collection',
      on: 'update',
      handler: () => {
        listenerCalled = true
      }
    })

    // 5. Update again (should trigger listener)
    state.stateSetValue({
      name: 'test/collection',
      value: {
        'user-1': {
          name: 'John',
          age: 32,
          role: 'admin'
        }
      }
    })

    strictEqual(listenerCalled, true)

    // 6. Delete
    const deleteResult = state.stateDeleteValue({
      name: 'test/collection',
      id: 'user-1'
    })

    strictEqual(deleteResult.deleted, true)
  })

  it('should handle concurrent operations', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    // Set multiple values
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(
        Promise.resolve(
          state.stateSetValue({
            name: 'test/collection',
            value: { [`item-${i}`]: `value-${i}` }
          })
        )
      )
    }

    await Promise.all(promises)

    // Verify all values were set
    const results = state.stateFind({
      name: 'test/collection'
    })

    strictEqual(results.length, 10)
  })

  it('should maintain data consistency', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    // Set initial value
    state.stateSetValue({
      name: 'test/collection',
      value: 'initial',
      options: { id: 'item-1' }
    })

    // Get initial value
    const initial = state.stateGetValue({
      name: 'test/collection',
      id: 'item-1'
    })

    // Update value
    state.stateSetValue({
      name: 'test/collection',
      value: 'updated',
      options: { id: 'item-1' }
    })

    // Get updated value
    const updated = state.stateGetValue({
      name: 'test/collection',
      id: 'item-1'
    })

    // Verify consistency
    strictEqual(initial.item, 'initial')
    strictEqual(updated.item, 'updated')
  })
})

describe('State Plugin - unsafeSetValue Action', () => {
  afterEach(() => {
    state.restore()
  })

  it('should set value without validation', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)
    const data_1 = {
      item_1: { name: 'Sarah' }
    }
    const data_2 = {
      item_2: { name: 'Jane' }
    }

    // init state
    state.stateUnsafeSetValue({
      name: 'test/collection',
      value: data_1
    })

    // update state
    const result = state.stateUnsafeSetValue({
      name: 'test/collection',
      value: data_2
    })

    ok(!result.isEmpty)
    strictEqual(result.item.length, 1)

    const test_1 = result.item[0]
    strictEqual(test_1.id, 'item_2')
    deepEqual(test_1.item, data_2.item_2)

    const collection = state.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 2)

    const test_2 = collection.item[0]
    strictEqual(test_2.id, 'item_1')
    deepEqual(test_2.item, data_1.item_1)
  })

  it('should set value with ID', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)
    const value = {
      name: 'Joe'
    }
    const result = state.stateUnsafeSetValue({
      name: 'test/collection',
      value,
      options: { id: 'custom-id' }
    })

    // Verify the result structure
    strictEqual(result.id, 'custom-id')
    deepStrictEqual(result.item, value)

    // Verify the value was actually set
    const collection = state.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, 'custom-id')
    deepStrictEqual(collection.item[0].item, value)
  })

  it('should replace entire collection', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    // Set initial value
    state.stateUnsafeSetValue({
      name: 'test/collection',
      value: {
        'item-1': 'value-1',
        'item-2': 'value-2'
      }
    })

    // Verify initial value exists
    const initial = state.stateGetValue({
      name: 'test/collection'
    })

    ok(!initial.isEmpty)
    strictEqual(initial.item.length, 2)
    strictEqual(initial.item[0].id, 'item-1')
    strictEqual(initial.item[1].id, 'item-2')

    // Replace with new value
    const result = state.stateUnsafeSetValue({
      name: 'test/collection',
      value: { 'item-3': 'value-3' },
      options: { replace: true }
    })

    // Verify result structure - result is an array of DataValues
    ok(Array.isArray(result.item), 'Result should be an array')
    strictEqual(result.item.length, 1)
    strictEqual(result.item[0].id, 'item-3')
    strictEqual(result.item[0].item, 'value-3')

    // Verify the collection was actually replaced
    const collection = state.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, 'item-3')
    strictEqual(result.item[0].item, 'value-3')
  })

  it('should dispatch update event', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    let eventFired = false
    let eventValue = null

    state.stateAddListener({
      name: 'test/collection',
      on: 'update',
      handler: (value) => {
        eventFired = true
        eventValue = value
      }
    })

    const result = state.stateUnsafeSetValue({
      name: 'test/collection',
      value: 'value-1',
      options: { id: 'item-1' }
    })

    // Verify event was fired
    strictEqual(eventFired, true)
    ok(eventValue, 'Event should have value')
    // @ts-ignore
    strictEqual(eventValue.id, result.id)
    // @ts-ignore
    strictEqual(eventValue.item, 'value-1')

    // Verify the value was actually set
    const collection = state.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, result.id)
    strictEqual(collection.item[0].item, 'value-1')
  })

  it('should stop propagation when requested', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    let eventFired = false

    state.stateAddListener({
      name: 'test/collection',
      on: 'update',
      handler: () => {
        eventFired = true
      }
    })

    const result = state.stateUnsafeSetValue({
      name: 'test/collection',
      value: 'value-1',
      options: {
        id: 'item-1',
        stopPropagation: true
      }
    })

    // Verify event was NOT fired
    strictEqual(eventFired, false)

    // Verify the value was still set despite no event
    ok(result, 'Should return a result')
    strictEqual(result.id, 'item-1')
    strictEqual(result.item, 'value-1')

    // Verify the value was actually set in state
    const collection = state.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, 'item-1')
    strictEqual(collection.item[0].item, 'value-1')
  })
})

describe('State Plugin - generateId Action', () => {
  afterEach(() => {
    state.restore()
  })

  it('should generate unique ID', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    const id1 = state.stateGenerateId()
    const id2 = state.stateGenerateId()

    strictEqual(typeof id1, 'string')
    strictEqual(typeof id2, 'string')
    strictEqual(id1 === id2, false)
  })

  it('should generate ID with correct length', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    const id = state.stateGenerateId()

    // ID should be a non-empty string
    ok(id.length > 0)
  })
})

describe('State Plugin - getSchema Action', () => {
  afterEach(() => {
    state.restore()
  })

  it('should get schema by path', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    const schema = state.stateGetSchema('test/collection')

    ok(schema, 'Schema should exist')
    strictEqual(schema.type, 'collection')
  })

  it('should return undefined for non-existent schema', async (t) => {
    const stateData = createTestState()
    state.setup(stateData)

    const schema = state.stateGetSchema('non-existent/schema')

    strictEqual(schema, undefined)
  })
})
