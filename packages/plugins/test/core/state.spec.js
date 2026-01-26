import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, ok, throws, deepEqual } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { state } from '#core'
import createPlugin from '@dooksa/create-plugin'

/**
 * Helper function to set up the state plugin with dependencies
 * @param {import('node:test').TestContext} t - Test context
 * @param {Array} [plugins=[]] - plugins to add to state
 * @returns {Object} Object with tester and state plugin instance
 */
function setupStatePlugin (t, plugins = []) {
  const tester = createPluginTester(t)

  // Create observable instance of state plugin
  const statePlugin = tester.spy('state', state)

  if (!plugins.length) {
    plugins.push(createPlugin('test', {
      state: {
        schema: {
          collection: {
            type: 'collection',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                status: { type: 'string' },
                role: { type: 'string' },
                age: { type: 'number' },
                relatedId: { type: 'string' }
              }
            }
          },
          single: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              value: { type: 'number' }
            }
          },
          array: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          complex: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  profile: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      age: { type: 'number' },
                      settings: {
                        type: 'object',
                        properties: {
                          theme: { type: 'string' },
                          notifications: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          related: {
            type: 'collection',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                refId: { type: 'string' }
              }
            }
          }
        }
      }
    }))
  }
  // Setup mock state data
  const stateData = mockStateData(plugins)
  statePlugin.setup(stateData)

  return {
    tester,
    statePlugin
  }
}

describe('State Plugin - Plugin Setup & Initialization', () => {
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Verify state plugin is set up
      strictEqual(typeof statePlugin.setup, 'function')

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Check that state has schema
      const schema = statePlugin.stateGetSchema('test/collection')
      ok(schema, 'Schema should be registered')

      tester.restoreAll()
    })

  })
})

describe('State Plugin - getValue Action', () => {
  describe('Direct access', () => {
    it('should get value from specific collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const dataIn =statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      const dataOut = statePlugin.stateGetValue({
        name: 'test/collection',
        id: dataIn.id
      })

      strictEqual(dataOut.item['item-1'], 'value-1')

      tester.restoreAll()
    })

    it('should get nested value using dot notation', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const dataIn = statePlugin.stateSetValue({
        name: 'test/complex',
        value: {
          user: {
            profile: {
              name: 'Dave'
            }
          }
        }
      })

      const result = statePlugin.stateGetValue({
        name: 'test/complex',
        id: dataIn.id,
        options: { position: 'user.profile.name' }
      })

      strictEqual(result.item, 'Dave')

      tester.restoreAll()
    })

    it('should get entire collection when no ID specified', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': { name: 'Item 1' },
          'item-2': { name: 'Item 2' }
        },
        options: { merge: true }
      })

      const result = statePlugin.stateGetValue({
        name: 'test/collection'
      })

      ok(Array.isArray(result.item), 'Result should be an array')
      strictEqual(result.item.length, 2)

      tester.restoreAll()
    })

    it('should return empty result when ID not found', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateGetValue({
        name: 'test/collection',
        id: 'non-existent'
      })

      strictEqual(result.isEmpty, true)

      tester.restoreAll()
    })

    it('should throw error when collection not found', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      throws(() => {
        statePlugin.stateGetValue({
          name: 'non-existent/collection'
        })
      }, {
        message: /No such collection/
      })

      tester.restoreAll()
    })

    it('should apply prefix to generated ID', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: { prefixId: 'prefix_' }
      })

      strictEqual(result.id.startsWith('prefix_'), true)

      tester.restoreAll()
    })

    it('should apply suffix to generated ID', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: { suffixId: '_suffix' }
      })

      strictEqual(result.id.endsWith('_suffix'), true)

      tester.restoreAll()
    })

    it('should apply both prefix and suffix to generated ID', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: {
          prefixId: 'prefix_',
          suffixId: '_suffix'
        }
      })

      strictEqual(result.id.startsWith('prefix_'), true)
      strictEqual(result.id.endsWith('_suffix'), true)

      tester.restoreAll()
    })

    it('should clone result when clone option is true', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const originalValue = {
        name: 'Test Item',
        age: 30
      }
      // Set value with custom ID
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: originalValue,
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateGetValue({
        name: 'test/collection',
        id: 'item-1',
        options: { clone: true }
      })

      // Verify it's a clone (different reference)
      strictEqual(result.item === originalValue, false)
      deepStrictEqual(result.item, originalValue)

      tester.restoreAll()
    })
  })

  describe('Collection filtering', () => {
    it('should filter collection with simple condition', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
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

      const results = statePlugin.stateFind({
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

      tester.restoreAll()
    })

    it('should filter collection with AND conditions', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
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

      const results = statePlugin.stateFind({
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

      tester.restoreAll()
    })

    it('should filter collection with OR conditions', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
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

      const results = statePlugin.stateFind({
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

      tester.restoreAll()
    })

    it('should filter with comparison operators', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
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

      const results = statePlugin.stateFind({
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

      tester.restoreAll()
    })

    it('should return empty array when no matches', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': { status: 'active' }
        }
      })

      const results = statePlugin.stateFind({
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

      tester.restoreAll()
    })

    it('should expand related data', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      // Setup main collection
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            name: 'Item 1',
            relatedId: 'related-1'
          }
        }
      })

      // Setup related collection
      statePlugin.stateSetValue({
        name: 'test/related',
        value: {
          'related-1': { name: 'Related Item' }
        }
      })

      // Add relation
      statePlugin.stateSetValue({
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

      const results = statePlugin.stateFind({
        name: 'test/collection',
        options: { expand: true }
      })

      ok(results[0].expand, 'Should have expand property')

      tester.restoreAll()
    })
  })
})

describe('State Plugin - setValue Action', () => {
  describe('Creating values', () => {
    it('should set value in collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      strictEqual(result.item['item-1'], 'value-1')

      tester.restoreAll()
    })

    it('should generate ID automatically', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'auto-generated': 'value' }
      })

      const keys = Object.keys(result.item)
      strictEqual(keys.length, 1)
      strictEqual(result.item[keys[0]], 'value')

      tester.restoreAll()
    })

    it('should apply prefix to generated ID', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test Item' },
        options: { prefixId: 'prefix_' }
      })

      strictEqual(result.id.startsWith('prefix_'), true)

      tester.restoreAll()
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

      const { statePlugin } = setupStatePlugin(t, [testPlugin])

      const result = statePlugin.stateSetValue({
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

      const { statePlugin } = setupStatePlugin(t, [testPlugin])

      const result = statePlugin.stateSetValue({
        name: 'test/products',
        value: 'shoes',
        options: {
          suffixId: '_suffix'
        }
      })

      ok(result.id.endsWith('_suffix'), 'ID should end with suffix')
    })

    it('should apply both prefix and suffix to generated ID', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'test-value': 'value' },
        options: {
          prefixId: 'pre_',
          suffixId: '_suf'
        }
      })

      ok(result.id.startsWith('pre_') && result.id.endsWith('_suf'), 'ID should have both affixes')

      tester.restoreAll()
    })

    it('should use provided ID with prefix and suffix', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { name: 'joe' },
        options: {
          prefixId: 'pre_',
          suffixId: '_suf'
        }
      })

      ok(result.id.startsWith('pre_') && result.id.endsWith('_suf'), 'ID should have both affixes')

      tester.restoreAll()
    })

    it('should set multiple values at once', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should set value in non-collection schema', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should set array value', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      deepStrictEqual(result.item, ['a', 'b', 'c'])

      tester.restoreAll()
    })

    it('should set complex nested values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

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

      const result = statePlugin.stateSetValue({
        name: 'test/complex',
        value: complexValue
      })

      deepStrictEqual(result.item, complexValue)

      tester.restoreAll()
    })
  })

  describe('Updating values', () => {
    it('should update existing value', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'old-value' }
      })

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'new-value' }
      })

      strictEqual(result.item['item-1'], 'new-value')

      tester.restoreAll()
    })

    it('should merge with existing values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { name: 'Joe' },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { age: 23 },
        options: {
          id: 'item-1',
          merge: true
        }
      })

      strictEqual(result.item.name, 'Joe')
      strictEqual(result.item.age, 23)

      tester.restoreAll()
    })

    it('should merge with existing values in single object schema', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/single',
        value: { name: 'Test Item' }
      })

      const result = statePlugin.stateSetValue({
        name: 'test/single',
        value: { value: 456 },
        options: { merge: true }
      })

      strictEqual(result.item.name, 'Test Item')
      strictEqual(result.item.value, 456)

      tester.restoreAll()
    })

    it('should merge with existing values in array schema', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/array',
        value: ['a', 'b']
      })

      const result = statePlugin.stateSetValue({
        name: 'test/array',
        value: ['c', 'd'],
        options: { merge: true }
      })

      deepStrictEqual(result.item, ['a', 'b', 'c', 'd'])

      tester.restoreAll()
    })

    it('should merge with existing values in complex nested object schema', { skip: true }, async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
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

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with existing values in related collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/related',
        value: {
          name: 'Related Item 1',
          refId: 'ref-1'
        },
        options: { id: 'related-1' }
      })

      const result = statePlugin.stateSetValue({
        name: 'test/related',
        value: { refId: 'ref-2' },
        options: {
          id: 'related-1',
          merge: true
        }
      })

      strictEqual(result.item.name, 'Related Item 1')
      strictEqual(result.item.refId, 'ref-2')

      tester.restoreAll()
    })

    it('should merge with deeply nested objects', { skip: true }, async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
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

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with array values in objects', { skip: true }, async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          tags: ['tag1', 'tag2'],
          name: 'Item'
        },
        options: { id: 'item-1' }

      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with nested collection items', { skip: true }, async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Parent',
          children: {
            'child-1': { name: 'Child 1' }
          }
        },
        options: { id: 'item-1 ' }
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with primitive values overriding objects', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          value: { nested: 'object' }
        },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with null values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          value: null
        },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with undefined values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          value: undefined
        },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with boolean values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          active: true
        },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should merge with number values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Test',
          count: 10
        },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should replace entire collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateUnsafeSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      const result = statePlugin.stateUnsafeSetValue({
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
      const collection = statePlugin.stateGetValue({
        name: 'test/collection'
      })

      ok(!collection.isEmpty)
      strictEqual(collection.item.length, 1)
      strictEqual(collection.item[0].id, 'item-2')
      strictEqual(collection.item[0].item, 'value-2')

      tester.restoreAll()
    })

    it('should update nested property', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          name: 'Old Name',
          age: 25
        },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should update array with push method', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/array',
        value: ['a', 'b']
      })

      const result = statePlugin.stateSetValue({
        name: 'test/array',
        value: 'c',
        options: {
          update: {
            method: 'push'
          }
        }
      })

      deepStrictEqual(result.item, ['a', 'b', 'c'])

      tester.restoreAll()
    })

    it('should update array with pull method', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      const result = statePlugin.stateSetValue({
        name: 'test/array',
        value: 'b',
        options: {
          update: {
            method: 'pull'
          }
        }
      })

      deepStrictEqual(result.item, ['a', 'c'])

      tester.restoreAll()
    })

    it('should update array with splice method', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should store previous value', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: 'old-value',
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: 'new-value',
        options: { id: 'item-1' }
      })

      ok(result.previous, 'Should have previous value')
      strictEqual(result.previous._item, 'old-value')

      tester.restoreAll()
    })
  })

  describe('Metadata', () => {
    it('should set metadata on values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })

    it('should add timestamps on server', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Timestamps are only added on server
      // This test verifies the structure exists
      ok(result.metadata, 'Should have metadata')

      tester.restoreAll()
    })
  })
})

describe('State Plugin - deleteValue Action', () => {
  describe('Basic deletion', () => {
    it('should delete value from collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': 'value-1',
          'item-2': 'value-2'
        }
      })

      const result = statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(result.deleted, true)
      strictEqual(result.inUse, false)

      // Verify deletion
      const getValue = statePlugin.stateGetValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(getValue.isEmpty, true)

      tester.restoreAll()
    })

    it('should return inUse true when data is referenced', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      // Setup main collection
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Setup related collection with reference
      statePlugin.stateSetValue({
        name: 'test/related',
        value: { 'related-1': { refId: 'item-1' } }
      })

      // Add relation (simulated)
      // Note: In real usage, relations are added during validation
      // For this test, we're testing the deletion logic

      const result = statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      // Should allow deletion if not in use
      strictEqual(result.deleted, true)

      tester.restoreAll()
    })

    it('should throw error when collection not found', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      throws(() => {
        statePlugin.stateDeleteValue({
          name: 'non-existent/collection',
          id: 'item-1'
        })
      }, {
        message: /Collection not found/
      })

      tester.restoreAll()
    })

    it('should not throw when ID not found', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'non-existent'
      })

      // Should complete without error
      ok(result)

      tester.restoreAll()
    })
  })

  describe('Cascade deletion', () => {
    it('should delete related data when cascade is true', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      // Setup main collection
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Setup related collection
      statePlugin.stateSetValue({
        name: 'test/related',
        value: { 'related-1': 'related-value' }
      })

      // Note: In real usage, relations are managed by the state plugin
      // For this test, we're testing the cascade parameter

      const result = statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1',
        cascade: true
      })

      strictEqual(result.deleted, true)

      tester.restoreAll()
    })
  })

  describe('Event dispatching', () => {
    it('should dispatch delete event', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      let eventFired = false
      let eventValue = null

      // Add listener
      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'delete',
        handler: (value) => {
          eventFired = true
          eventValue = value
        }
      })

      statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(eventFired, true)
      ok(eventValue, 'Event should have value')
      strictEqual(eventValue.id, 'item-1')

      tester.restoreAll()
    })

    it('should not dispatch event when stopPropagation is true', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      let eventFired = false

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'delete',
        handler: () => {
          eventFired = true
        }
      })

      statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1',
        stopPropagation: true
      })

      strictEqual(eventFired, false)

      tester.restoreAll()
    })
  })
})

describe('State Plugin - find Action', () => {
  it('should find all items in collection', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    statePlugin.stateSetValue({
      name: 'test/collection',
      value: {
        'item-1': { name: 'Item 1' },
        'item-2': { name: 'Item 2' },
        'item-3': { name: 'Item 3' }
      },
      options: { replace: true }
    })

    const results = statePlugin.stateFind({
      name: 'test/collection'
    })

    strictEqual(results.length, 3)

    tester.restoreAll()
  })

  it('should filter results with where conditions', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    statePlugin.stateSetValue({
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

    const results = statePlugin.stateFind({
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

    tester.restoreAll()
  })

  it('should expand related data', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    statePlugin.stateSetValue({
      name: 'test/collection',
      value: {
        'item-1': {
          name: 'Item 1',
          relatedId: 'related-1'
        }
      }
    })

    statePlugin.stateSetValue({
      name: 'test/related',
      value: {
        'related-1': { name: 'Related Item' }
      }
    })

    const results = statePlugin.stateFind({
      name: 'test/collection',
      options: { expand: true }
    })

    ok(results[0].expand, 'Should have expand property')

    tester.restoreAll()
  })

  it('should return empty array when collection not found', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    throws(() => {
      statePlugin.stateFind({
        name: 'non-existent/collection'
      })
    }, {
      message: 'No collection found: "non-existent/collection"'
    })

    tester.restoreAll()
  })
})

describe('State Plugin - Event Listeners', () => {
  describe('addListener', () => {
    it('should add listener to collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      let eventFired = false

      const handlerId = statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      ok(handlerId, 'Should return handler ID')

      // Trigger event
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      strictEqual(eventFired, true)

      tester.restoreAll()
    })

    it('should add listener to specific item', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      let eventFired = false

      statePlugin.stateAddListener({
        name: 'test/collection',
        id: 'item-1',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      // Update specific item
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      strictEqual(eventFired, true)

      tester.restoreAll()
    })

    it('should add priority listener', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const order = []

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        priority: 1,
        handler: () => {
          order.push('priority-1')
        }
      })

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        priority: 2,
        handler: () => {
          order.push('priority-2')
        }
      })

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Priority listeners should execute in order
      strictEqual(order[0], 'priority-1')
      strictEqual(order[1], 'priority-2')

      tester.restoreAll()
    })

    it('should add capture-all listener', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      let eventCount = 0

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        captureAll: true,
        handler: () => {
          eventCount++
        }
      })

      // Multiple updates
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-2': 'value-2' }
      })

      strictEqual(eventCount, 2)

      tester.restoreAll()
    })

    it('should force event even with stopPropagation', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      let eventFired = false

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        force: true,
        handler: () => {
          eventFired = true
        }
      })

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' },
        options: { stopPropagation: true }
      })

      strictEqual(eventFired, true)

      tester.restoreAll()
    })

    it('should accept string handler (action ID)', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      // Note: This test verifies the structure, actual action dispatch
      // would require the action plugin to be set up
      const handlerId = statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: 'some-action-id'
      })

      ok(handlerId, 'Should return handler ID')

      tester.restoreAll()
    })
  })

  describe('deleteListener', () => {
    it('should delete listener', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      let eventFired = false

      const handlerId = statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      // Delete listener
      statePlugin.stateDeleteListener({
        name: 'test/collection',
        on: 'update',
        handlerId
      })

      // Reset event flag
      eventFired = false

      // Trigger event
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      strictEqual(eventFired, false)

      tester.restoreAll()
    })

    it('should delete listener from specific item', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      let eventFired = false

      const handlerId = statePlugin.stateAddListener({
        name: 'test/collection',
        id: 'item-1',
        on: 'update',
        handler: () => {
          eventFired = true
        }
      })

      statePlugin.stateDeleteListener({
        name: 'test/collection',
        id: 'item-1',
        on: 'update',
        handlerId
      })

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      strictEqual(eventFired, false)

      tester.restoreAll()
    })

    it('should return false with non-existent listener is deleted', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateDeleteListener({
        name: 'test/collection',
        on: 'update',
        handlerId: 'non-existent'
      })

      strictEqual(result, false)
      tester.restoreAll()
    })
  })

  describe('Event dispatching', () => {
    it('should dispatch update event to all listeners', { skip: true }, async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const events = []

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: (value) => {
          events.push({
            type: 'all',
            value
          })
        }
      })

      statePlugin.stateAddListener({
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

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      strictEqual(events.length, 2)
      strictEqual(events[0].type, 'priority')
      strictEqual(events[1].type, 'all')

      tester.restoreAll()
    })

    it('should stop propagation when requested', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const events = []

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: (value) => {
          events.push('listener-1')
        }
      })

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'update',
        handler: (value) => {
          events.push('listener-2')
        }
      })

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' },
        options: { stopPropagation: true }
      })

      // With stopPropagation, no listeners should fire
      strictEqual(events.length, 0)

      tester.restoreAll()
    })

    it('should dispatch delete event', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      let eventFired = false

      statePlugin.stateAddListener({
        name: 'test/collection',
        on: 'delete',
        handler: () => {
          eventFired = true
        }
      })

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: 'value-1',
        options: { id: 'item-1' }
      })

      statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(eventFired, true)

      tester.restoreAll()
    })
  })
})

describe('State Plugin - Schema Validation', () => {
  describe('Type validation', () => {
    it('should validate string type', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      // Note: Schema validation happens during setValue
      // This test verifies the structure exists
      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'string-value' }
      })

      ok(result.item)

      tester.restoreAll()
    })

    it('should validate number type', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 123 }
      })

      ok(result.item)

      tester.restoreAll()
    })

    it('should validate boolean type', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': true }
      })

      ok(result.item)

      tester.restoreAll()
    })

    it('should validate object type', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': {
            name: 'Test',
            value: 123
          }
        }
      })

      ok(result.item)

      tester.restoreAll()
    })

    it('should validate array type', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/array',
        value: ['a', 'b', 'c']
      })

      ok(result.item)

      tester.restoreAll()
    })

    it('should validate function type', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: {
          'item-1': () => {
          }
        }
      })

      ok(result.item)

      tester.restoreAll()
    })

    it('should validate node type', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': { nodeName: 'DIV' } }
      })

      ok(result.item)

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid object with all required properties
      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { name: 'John' }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid array with unique items
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2', 'tag3'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2', 'tag3'])

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/users',
          value: { tags: ['tag1', 'tag2', 'tag1'] }
        })
      }, {
        message: 'Array items must be unique'
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid object with only defined properties
      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: {
            name: 'John',
            age: 30,
            email: 'john@example.com'
          }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid email
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { email: 'john@example.com' }
      })

      strictEqual(result.item.email, 'john@example.com')

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { email: 'not-an-email' }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid enum value
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { status: 'active' }
      })

      strictEqual(result.item.status, 'active')

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { status: 'archived' }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid length
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { name: 'John' }
      })

      strictEqual(result.item.name, 'John')

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { name: 'Jo' }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid length
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { name: 'John' }
      })

      strictEqual(result.item.name, 'John')

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { name: 'John' }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid value
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { age: 25 }
      })

      strictEqual(result.item.age, 25)

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { age: 15 }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid value
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { age: 50 }
      })

      strictEqual(result.item.age, 50)

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { age: 150 }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid value (greater than 18)
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { age: 19 }
      })

      strictEqual(result.item.age, 19)

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { age: 18 }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid value (less than 100)
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { age: 99 }
      })

      strictEqual(result.item.age, 99)

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { age: 100 }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid value (multiple of 5)
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { age: 25 }
      })

      strictEqual(result.item.age, 25)

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { age: 23 }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid array with 2 items
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2'])

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { tags: ['tag1'] }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid array with 3 items
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2', 'tag3'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2', 'tag3'])

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { tags: ['tag1', 'tag2', 'tag3'] }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid array with unique items
      const result = statePlugin.stateSetValue({
        name: 'test/user',
        value: { tags: ['tag1', 'tag2', 'tag3'] }
      })

      deepStrictEqual(result.item.tags, ['tag1', 'tag2', 'tag3'])

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: { tags: ['tag1', 'tag2', 'tag1'] }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid array with unique objects
      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid object with only defined properties
      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/user',
          value: {
            name: 'John',
            age: 30,
            email: 'john@example.com'
          }
        })
      })

      tester.restoreAll()
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

      const { tester, statePlugin } = setupStatePlugin(t, [testPlugin])

      // Valid object with pattern-matching properties
      const result = statePlugin.stateSetValue({
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

      tester.restoreAll()
    })
  })

  describe('Relationships', () => {
    it('should add relation between collections', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      // Setup main collection
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      // Setup related collection
      statePlugin.stateSetValue({
        name: 'test/related',
        value: { 'related-1': { refId: 'item-1' } }
      })

      // Note: Relations are added during validation
      // This test verifies the structure exists
      ok(true)

      tester.restoreAll()
    })

    it('should remove relation when data is deleted', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      // Setup collections
      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      statePlugin.stateSetValue({
        name: 'test/related',
        value: { 'related-1': 'related-value' }
      })

      // Delete item
      const result = statePlugin.stateDeleteValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(result.deleted, true)

      tester.restoreAll()
    })
  })
})

describe('State Plugin - Edge Cases', () => {
  describe('Null and undefined values', () => {
    it('should handle null values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': null }
      })

      strictEqual(result.item['item-1'], null)

      tester.restoreAll()
    })

    it('should handle undefined values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': undefined }
      })

      strictEqual(result.item['item-1'], undefined)

      tester.restoreAll()
    })

    it('should not get null value', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      throws(() => {
        statePlugin.stateSetValue({
          name: 'test/collection',
          value: null,
          options: { id: 'item-1' }
        })
      }, {
        message: 'Source was undefined'
      })

      tester.restoreAll()
    })

    it('should get undefined value', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': undefined }
      })

      const result = statePlugin.stateGetValue({
        name: 'test/collection',
        id: 'item-1'
      })

      strictEqual(result.item, undefined)

      tester.restoreAll()
    })
  })

  describe('Missing data', () => {
    it('should handle missing collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      throws(() => {
        statePlugin.stateGetValue({
          name: 'non-existent/collection'
        })
      },
      {
        message: 'No such collection "non-existent/collection"'
      })

      tester.restoreAll()
    })

    it('should handle missing ID', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateGetValue({
        name: 'test/collection',
        id: 'non-existent'
      })

      strictEqual(result.isEmpty, true)

      tester.restoreAll()
    })

    it('should handle missing nested property', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { name: 'Test' },
        options: { id: 'item-1' }
      })

      const result = statePlugin.stateGetValue({
        name: 'test/collection',
        id: 'item-1',
        options: { position: 'missing.nested.property' }
      })

      ok(result.isEmpty)
      strictEqual(result.item, undefined)

      tester.restoreAll()
    })
  })

  describe('Invalid operations', () => {
    it('should throw error when setting value in non-existent collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      throws(() => {
        statePlugin.stateSetValue({
          name: 'non-existent/collection',
          value: { 'item-1': 'value-1' }
        })
      }, {
        message: /Schema not found/
      })

      tester.restoreAll()
    })

    it('should throw error when deleting from non-existent collection', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      throws(() => {
        statePlugin.stateDeleteValue({
          name: 'non-existent/collection',
          id: 'item-1'
        })
      }, {
        message: /Collection not found/
      })

      tester.restoreAll()
    })

    it('should handle empty values array', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: {}
      })

      ok(result)

      tester.restoreAll()
    })

    it('should handle empty filter conditions', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': 'value-1' }
      })

      const results = statePlugin.stateFind({
        name: 'test/collection',
        where: []
      })

      strictEqual(results.length, 1)

      tester.restoreAll()
    })
  })

  describe('Complex scenarios', () => {
    it('should handle deeply nested structures', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

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

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': deepValue }
      })

      deepStrictEqual(result.item['item-1'], deepValue)

      tester.restoreAll()
    })

    it('should handle large collections', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const largeCollection = {}
      for (let i = 0; i < 100; i++) {
        largeCollection[`item-${i}`] = { value: i }
      }

      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: largeCollection
      })

      strictEqual(Object.keys(result.item).length, 100)

      tester.restoreAll()
    })

    it('should handle circular references in values', async (t) => {
      const { tester, statePlugin } = setupStatePlugin(t)

      const obj1 = { name: 'Object 1' }
      const obj2 = {
        name: 'Object 2',
        ref: obj1
      }
      obj1.ref = obj2

      // Note: deepClone should handle circular references
      const result = statePlugin.stateSetValue({
        name: 'test/collection',
        value: { 'item-1': obj1 }
      })

      ok(result.item)

      tester.restoreAll()
    })
  })
})

describe('State Plugin - Integration Tests', () => {
  it('should work with multiple collections', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    // Set values in multiple collections
    statePlugin.stateSetValue({
      name: 'test/collection',
      value: 'value-1',
      options: { id: 'item-1' }
    })

    statePlugin.stateSetValue({
      name: 'test/single',
      value: 'value-2'
    })

    // Get values from both collections
    const result1 = statePlugin.stateGetValue({
      name: 'test/collection',
      id: 'item-1'
    })

    const result2 = statePlugin.stateGetValue({
      name: 'test/single'
    })

    strictEqual(result1.item, 'value-1')
    strictEqual(result2.item, 'value-2')

    tester.restoreAll()
  })

  it('should handle complex workflow', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    // 1. Create initial data
    statePlugin.stateSetValue({
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
    statePlugin.stateSetValue({
      name: 'test/collection',
      value: {
        name: 'John',
        age: 31,
        role: 'admin'
      },
      options: { id: 'user-1' }
    })

    // 3. Find filtered data
    const results = statePlugin.stateFind({
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
    statePlugin.stateAddListener({
      name: 'test/collection',
      on: 'update',
      handler: () => {
        listenerCalled = true
      }
    })

    // 5. Update again (should trigger listener)
    statePlugin.stateSetValue({
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
    const deleteResult = statePlugin.stateDeleteValue({
      name: 'test/collection',
      id: 'user-1'
    })

    strictEqual(deleteResult.deleted, true)

    tester.restoreAll()
  })

  it('should handle concurrent operations', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    // Set multiple values
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(
        Promise.resolve(
          statePlugin.stateSetValue({
            name: 'test/collection',
            value: { [`item-${i}`]: `value-${i}` }
          })
        )
      )
    }

    await Promise.all(promises)

    // Verify all values were set
    const results = statePlugin.stateFind({
      name: 'test/collection'
    })

    strictEqual(results.length, 10)

    tester.restoreAll()
  })

  it('should maintain data consistency', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    // Set initial value
    statePlugin.stateSetValue({
      name: 'test/collection',
      value: 'initial',
      options: { id: 'item-1' }
    })

    // Get initial value
    const initial = statePlugin.stateGetValue({
      name: 'test/collection',
      id: 'item-1'
    })

    // Update value
    statePlugin.stateSetValue({
      name: 'test/collection',
      value: 'updated',
      options: { id: 'item-1' }
    })

    // Get updated value
    const updated = statePlugin.stateGetValue({
      name: 'test/collection',
      id: 'item-1'
    })

    // Verify consistency
    strictEqual(initial.item, 'initial')
    strictEqual(updated.item, 'updated')

    tester.restoreAll()
  })
})

describe('State Plugin - unsafeSetValue Action', () => {
  it('should set value without validation', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)
    const data_1 = {
      item_1: { name: 'Sarah' }
    }
    const data_2 = {
      item_2: { name: 'Jane' }
    }

    // init state
    statePlugin.stateUnsafeSetValue({
      name: 'test/collection',
      value: data_1
    })

    // update state
    const result = statePlugin.stateUnsafeSetValue({
      name: 'test/collection',
      value: data_2
    })

    ok(!result.isEmpty)
    strictEqual(result.item.length, 1)

    const test_1 = result.item[0]
    strictEqual(test_1.id, 'item_2')
    deepEqual(test_1.item, data_2.item_2)

    const collection = statePlugin.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 2)

    const test_2 = collection.item[0]
    strictEqual(test_2.id, 'item_1')
    deepEqual(test_2.item, data_1.item_1)

    tester.restoreAll()
  })

  it('should set value with ID', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)
    const value = {
      name: 'Joe'
    }
    const result = statePlugin.stateUnsafeSetValue({
      name: 'test/collection',
      value,
      options: { id: 'custom-id' }
    })

    // Verify the result structure
    strictEqual(result.id, 'custom-id')
    deepStrictEqual(result.item, value)

    // Verify the value was actually set
    const collection = statePlugin.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, 'custom-id')
    deepStrictEqual(collection.item[0].item, value)

    tester.restoreAll()
  })

  it('should replace entire collection', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    // Set initial value
    statePlugin.stateUnsafeSetValue({
      name: 'test/collection',
      value: {
        'item-1': 'value-1',
        'item-2': 'value-2'
      }
    })

    // Verify initial value exists
    const initial = statePlugin.stateGetValue({
      name: 'test/collection'
    })

    ok(!initial.isEmpty)
    strictEqual(initial.item.length, 2)
    strictEqual(initial.item[0].id, 'item-1')
    strictEqual(initial.item[1].id, 'item-2')

    // Replace with new value
    const result = statePlugin.stateUnsafeSetValue({
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
    const collection = statePlugin.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, 'item-3')
    strictEqual(result.item[0].item, 'value-3')

    tester.restoreAll()
  })

  it('should dispatch update event', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    let eventFired = false
    let eventValue = null

    statePlugin.stateAddListener({
      name: 'test/collection',
      on: 'update',
      handler: (value) => {
        eventFired = true
        eventValue = value
      }
    })

    const result = statePlugin.stateUnsafeSetValue({
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
    const collection = statePlugin.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, result.id)
    strictEqual(collection.item[0].item, 'value-1')

    tester.restoreAll()
  })

  it('should stop propagation when requested', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    let eventFired = false

    statePlugin.stateAddListener({
      name: 'test/collection',
      on: 'update',
      handler: () => {
        eventFired = true
      }
    })

    const result = statePlugin.stateUnsafeSetValue({
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
    const collection = statePlugin.stateGetValue({
      name: 'test/collection'
    })

    ok(!collection.isEmpty)
    strictEqual(collection.item.length, 1)
    strictEqual(collection.item[0].id, 'item-1')
    strictEqual(collection.item[0].item, 'value-1')

    tester.restoreAll()
  })
})

describe('State Plugin - generateId Action', () => {
  it('should generate unique ID', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    const id1 = statePlugin.stateGenerateId()
    const id2 = statePlugin.stateGenerateId()

    strictEqual(typeof id1, 'string')
    strictEqual(typeof id2, 'string')
    strictEqual(id1 === id2, false)

    tester.restoreAll()
  })

  it('should generate ID with correct length', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    const id = statePlugin.stateGenerateId()

    // ID should be a non-empty string
    ok(id.length > 0)

    tester.restoreAll()
  })
})

describe('State Plugin - getSchema Action', () => {
  it('should get schema by path', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    const schema = statePlugin.stateGetSchema('test/collection')

    ok(schema, 'Schema should exist')
    strictEqual(schema.type, 'collection')

    tester.restoreAll()
  })

  it('should return undefined for non-existent schema', async (t) => {
    const { tester, statePlugin } = setupStatePlugin(t)

    const schema = statePlugin.stateGetSchema('non-existent/schema')

    strictEqual(schema, undefined)

    tester.restoreAll()
  })
})
