import { describe, it } from 'node:test'
import { ok, strictEqual } from 'node:assert'
import parseAction from '../../src/server/parse-action.js'

describe('parseAction', function () {
  describe('Basic Functionality', function () {
    it('should parse simple action with dispatch method', function () {
      const data = {
        action_dispatch: {
          id: 'component-123',
          payload: {
            value: 'Hello World'
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'abc123',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.id, undefined)
      strictEqual(result.blockSequences.length, 1)
      strictEqual(Object.keys(result.blocks).length, 4)

      const dispatchBlock = result.blocks[result.blockSequences[0]]
      strictEqual(dispatchBlock.method, 'action_dispatch')
      strictEqual(dispatchBlock.blockValues.length, 2)
    })

    it('should handle primitive values', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          value: 42
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'test',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      // Blocks are created in order: id property, value property, then method
      // test_1: key='id', value='test'
      // test_2: key='value', value=42
      // test_3: method='action_dispatch', blockValues=['test_1', 'test_2']
      strictEqual(result.blocks['test_3'].method, 'action_dispatch')
      strictEqual(result.blocks['test_2'].value, 42)
    })

    it('should handle $null values', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          value: '$null'
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'test',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      // $null creates a block with key but no value
      const dispatchBlock = result.blocks[result.blockSequences[0]]
      strictEqual(dispatchBlock.blockValues.length, 2)
      strictEqual(result.blocks['test_1'].key, 'id')
      strictEqual(result.blocks['test_1'].value, 'test')
      strictEqual(result.blocks['test_2'].key, 'value')
      strictEqual(result.blocks['test_2'].value, undefined)
    })
  })

  describe('Special Key Handling', function () {
    it('should handle $id at root level', function () {
      const data = {
        $id: 'my-action-id',
        action_dispatch: {
          id: 'component-123'
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'xyz',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      strictEqual(result.id, 'my-action-id')
      // $id is processed first, then action_dispatch creates blocks
      // xyz_1: key='id', value='component-123'
      // xyz_2: method='action_dispatch', blockValues=['xyz_1']
      strictEqual(result.blocks['xyz_2'].method, 'action_dispatch')
    })

    it('should handle $ref in nested objects', function () {
      const data = {
        action_dispatch: {
          id: 'component-123',
          payload: {
            value: {
              $ref: 'some-reference'
            }
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'ref',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.$refs.length, 1)
      strictEqual(result.$refs[0][1], 'some-reference')
      strictEqual(result.blocks[result.$refs[0][0]].$ref, 'some-reference')
    })

    it('should handle $sequenceRef in action_ifElse', function () {
      const data = {
        action_ifElse: {
          if: [{
            op: '==',
            left: 'value',
            right: 'active'
          }],
          then: [{ $sequenceRef: 0 }],
          else: [{ $sequenceRef: 1 }]
        }
      }

      const methods = { action_ifElse: true }
      const uuid = {
        prefix: 'seq',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.$sequenceRefs.length, 2)
      strictEqual(result.$sequenceRefs[0][1], 0)
      strictEqual(result.$sequenceRefs[1][1], 1)
    })
  })

  describe('Method Detection', function () {
    it('should identify action methods and create block sequences', function () {
      const data = {
        action_dispatch: {
          id: 'test1'
        },
        state_setValue: {
          name: 'test',
          value: 'hello'
        }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'mth',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 2)
      // action_dispatch creates blocks: mth_1 (id), mth_4 (method)
      // state_setValue creates blocks: mth_2 (name), mth_3 (value), mth_5 (method)
      strictEqual(result.blocks['mth_4'].method, 'action_dispatch')
      strictEqual(result.blocks['mth_5'].method, 'state_setValue')
    })

    it('should handle action_ifElse as special case', function () {
      const data = {
        action_ifElse: {
          if: [{ op: '==' }],
          then: [],
          else: []
        }
      }

      const methods = { action_ifElse: true }
      const uuid = {
        prefix: 'ife',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 1)
      // The method block has method property
      const methodBlockId = result.blockSequences[0]
      ok(result.blocks[methodBlockId].ifElse)
    })

    it('should handle mixed methods and non-methods', function () {
      const data = {
        action_dispatch: { id: 'test' },
        someProperty: 'value',
        state_setValue: { name: 'test' }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'mix',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 2)

      // Find method blocks by their method property
      const methodBlocks = Object.entries(result.blocks)
        .filter(([id, block]) => block.method)

      strictEqual(methodBlocks.length, 2)

      // Check that both methods are present
      const methodsFound = methodBlocks.map(([id, block]) => block.method)
      strictEqual(methodsFound.includes('action_dispatch'), true)
      strictEqual(methodsFound.includes('state_setValue'), true)

      // Find the non-method block - it should have value 'value' but no key
      const nonMethodBlock = Object.entries(result.blocks)
        .find(([id, block]) => !block.method && block.value === 'value')
      strictEqual(nonMethodBlock !== undefined, true)
      strictEqual(nonMethodBlock[1].value, 'value')
    })
  })

  describe('Data Type Handling', function () {
    it('should handle arrays with dataType array', function () {
      const data = {
        action_dispatch: {
          items: [1, 2, 3]
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'arr',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const arrayBlockId = Object.keys(result.blocks).find(id => result.blocks[id].dataType === 'array'
      )
      strictEqual(arrayBlockId !== undefined, true)
      strictEqual(result.blocks[arrayBlockId].blockValues.length, 3)
    })

    it('should handle objects with dataType object', function () {
      const data = {
        action_dispatch: {
          config: {
            option1: 'value1',
            option2: 'value2'
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'obj',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const objectBlockId = Object.keys(result.blocks).find(id => result.blocks[id].dataType === 'object'
      )
      strictEqual(objectBlockId !== undefined, true)
      strictEqual(result.blocks[objectBlockId].blockValues.length, 2)
    })

    it('should handle objects containing methods (blockValue)', function () {
      const data = {
        action_dispatch: {
          nested: {
            state_setValue: {
              name: 'test'
            }
          }
        }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'nest',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const blockValueId = Object.keys(result.blocks).find(id => result.blocks[id].blockValue !== undefined
      )
      strictEqual(blockValueId !== undefined, true)
      strictEqual(typeof result.blocks[blockValueId].blockValue, 'string')
    })
  })

  describe('Block Structure', function () {
    it('should create proper block hierarchy', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          payload: {
            value: 'hello'
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'hier',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const rootBlock = result.blocks[result.blockSequences[0]]
      strictEqual(rootBlock.method, 'action_dispatch')
      strictEqual(rootBlock.blockValues.length, 2)

      const idBlock = result.blocks[rootBlock.blockValues[0]]
      const payloadBlock = result.blocks[rootBlock.blockValues[1]]

      strictEqual(idBlock.key, 'id')
      strictEqual(idBlock.value, 'test')
      strictEqual(payloadBlock.key, 'payload')
      strictEqual(payloadBlock.dataType, 'object')
      strictEqual(payloadBlock.blockValues.length, 1)
    })

    it('should handle empty objects and arrays', function () {
      const data = {
        action_dispatch: {
          emptyObj: {},
          emptyArr: []
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'empty',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const objBlockId = Object.keys(result.blocks).find(id => result.blocks[id].key === 'emptyObj'
      )
      const arrBlockId = Object.keys(result.blocks).find(id => result.blocks[id].key === 'emptyArr'
      )

      strictEqual(result.blocks[objBlockId].dataType, 'object')
      strictEqual(result.blocks[objBlockId].blockValues.length, 0)
      strictEqual(result.blocks[arrBlockId].dataType, 'array')
      strictEqual(result.blocks[arrBlockId].blockValues.length, 0)
    })
  })

  describe('Reference Resolution', function () {
    it('should track $refs in result array', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          payload: {
            data: {
              $ref: 'reference-id'
            }
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'ref',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.$refs.length, 1)
      strictEqual(Array.isArray(result.$refs[0]), true)
      strictEqual(result.$refs[0].length, 2)
      strictEqual(typeof result.$refs[0][0], 'string')
      strictEqual(result.$refs[0][1], 'reference-id')
    })

    it('should track $sequenceRefs in result array', function () {
      const data = {
        action_ifElse: {
          if: [{ op: '==' }],
          then: [{ $sequenceRef: 0 }],
          else: [{ $sequenceRef: 1 }]
        }
      }

      const methods = { action_ifElse: true }
      const uuid = {
        prefix: 'seq',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.$sequenceRefs.length, 2)
      strictEqual(result.$sequenceRefs[0][1], 0)
      strictEqual(result.$sequenceRefs[1][1], 1)
    })
  })

  describe('UUID Generation', function () {
    it('should generate unique IDs with prefix and increment', function () {
      const data = {
        action_dispatch: { id: 'test' },
        state_setValue: { name: 'test' }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'unique',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const blockIds = Object.keys(result.blocks)
      strictEqual(blockIds.length, 4)

      blockIds.forEach(id => {
        strictEqual(id.startsWith('unique_'), true)
      })

      const increments = blockIds.map(id => parseInt(id.split('_')[1]))
      const uniqueIncrements = [...new Set(increments)]
      strictEqual(uniqueIncrements.length, blockIds.length)
    })

    it('should increment UUID counter correctly', function () {
      const data = {
        action_dispatch: { id: 'test' }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'inc',
        increment: 5
      }

      const result = parseAction(data, methods, uuid)

      const blockIds = Object.keys(result.blocks)
      const firstId = blockIds[0]
      strictEqual(firstId, 'inc_6')

      // UUID should be updated (2 blocks created: inc_6, inc_7)
      strictEqual(uuid.increment, 7)
    })

    it('should handle multiple calls with same UUID object', function () {
      const data1 = {
        action_dispatch: { id: 'test1' }
      }
      const data2 = {
        action_dispatch: { id: 'test2' }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'shared',
        increment: 0
      }

      const result1 = parseAction(data1, methods, uuid)
      const result2 = parseAction(data2, methods, uuid)

      const blockIds1 = Object.keys(result1.blocks)
      const blockIds2 = Object.keys(result2.blocks)

      // First call creates shared_1, shared_2
      strictEqual(blockIds1[0], 'shared_1')
      // Second call continues from where first left off
      strictEqual(blockIds2[0], 'shared_3')
    })
  })

  describe('Block Sequences', function () {
    it('should track execution order of block sequences', function () {
      const data = {
        action_dispatch: { id: 'first' },
        state_setValue: { name: 'second' }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'seq',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 2)
      strictEqual(result.blocks[result.blockSequences[0]].method, 'action_dispatch')
      strictEqual(result.blocks[result.blockSequences[1]].method, 'state_setValue')
    })

    it('should only include method blocks in sequences', function () {
      const data = {
        action_dispatch: { id: 'test' },
        regularProp: 'value',
        state_setValue: { name: 'test' }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'seq',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 2)

      result.blockSequences.forEach(blockId => {
        const block = result.blocks[blockId]
        strictEqual(block.method !== undefined, true)
      })
    })

    it('should handle nested method blocks', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          nested: {
            state_setValue: {
              name: 'nested'
            }
          }
        }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'nest',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 2)

      // Find method blocks by their method property
      const methodBlocks = Object.entries(result.blocks)
        .filter(([id, block]) => block.method)
        .sort((a, b) => parseInt(a[0].split('_')[1]) - parseInt(b[0].split('_')[1]))

      // The order depends on processing order - state_setValue is processed first
      strictEqual(methodBlocks[0][1].method, 'state_setValue')
      strictEqual(methodBlocks[1][1].method, 'action_dispatch')
    })
  })

  describe('Recursive Processing', function () {
    it('should handle deeply nested structures', function () {
      const data = {
        action_dispatch: {
          level1: {
            level2: {
              level3: {
                level4: {
                  value: 'deep'
                }
              }
            }
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'deep',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const blockCount = Object.keys(result.blocks).length
      strictEqual(blockCount > 4, true)

      const deepValueBlock = Object.values(result.blocks).find(block => block.value === 'deep'
      )
      strictEqual(deepValueBlock !== undefined, true)
      strictEqual(deepValueBlock.key, 'value')
    })

    it('should handle arrays of objects with methods', function () {
      const data = {
        action_dispatch: {
          items: [
            { state_setValue: { name: 'item1' } },
            { state_setValue: { name: 'item2' } }
          ]
        }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'arr',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 3)

      const arrayBlock = Object.values(result.blocks).find(b => b.dataType === 'array')
      strictEqual(arrayBlock.blockValues.length, 2)
    })

    it('should handle complex mixed structures', function () {
      const data = {
        $id: 'complex-action',
        action_dispatch: {
          id: 'dispatch-1',
          payload: {
            data: {
              items: [1, 2, { nested: 'value' }],
              config: {
                enabled: true,
                nested: {
                  deep: {
                    $ref: 'some-ref'
                  }
                }
              }
            }
          }
        },
        state_setValue: {
          name: 'test',
          value: {
            $sequenceRef: 0
          }
        }
      }

      const methods = {
        action_dispatch: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'complex',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.id, 'complex-action')
      strictEqual(result.blockSequences.length, 2)
      strictEqual(result.$refs.length, 1)
      strictEqual(result.$sequenceRefs.length, 1)

      const blockCount = Object.keys(result.blocks).length
      strictEqual(blockCount > 10, true)
    })
  })

  describe('Edge Cases', function () {
    it('should handle empty data object', function () {
      const data = {}
      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'empty',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      strictEqual(result.id, undefined)
      strictEqual(result.blockSequences.length, 0)
      strictEqual(Object.keys(result.blocks).length, 0)
      strictEqual(result.$refs.length, 0)
      strictEqual(result.$sequenceRefs.length, 0)
    })

    it('should handle data with only $id', function () {
      const data = { $id: 'only-id' }
      const methods = {}
      const uuid = {
        prefix: 'id',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.id, 'only-id')
      strictEqual(result.blockSequences.length, 0)
      strictEqual(Object.keys(result.blocks).length, 0)
    })

    it('should handle data with only references', function () {
      const data = {
        $id: 'ref-action',
        action_dispatch: {
          value: { $ref: 'ref1' }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'ref',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.id, 'ref-action')
      strictEqual(result.$refs.length, 1)
      strictEqual(result.blocks[result.$refs[0][0]].$ref, 'ref1')
    })

    it('should handle methods parameter with no matching methods', function () {
      const data = {
        action_dispatch: { id: 'test' },
        state_setValue: { name: 'test' }
      }

      const methods = {}
      const uuid = {
        prefix: 'nomatch',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.blockSequences.length, 0)
      // Each object creates 2 blocks (key-value), so 4 total
      strictEqual(Object.keys(result.blocks).length, 4)

      const blocks = Object.values(result.blocks)
      blocks.forEach(block => {
        // Some blocks may not have a key (like value-only blocks)
        // But none should have a method since methods parameter is empty
        strictEqual(block.method, undefined)
      })
    })

    it('should handle special property $id in nested objects', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          nested: {
            $id: 'nested-id',
            value: 'test'
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'nestid',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      const nestedBlockId = Object.keys(result.blocks).find(id => result.blocks[id].key === 'nested'
      )
      const nestedBlock = result.blocks[nestedBlockId]

      strictEqual(nestedBlock.blockValues.length, 2)

      const dollarIdBlockId = nestedBlock.blockValues.find(id => result.blocks[id].key === '$id'
      )
      strictEqual(dollarIdBlockId !== undefined, true)
      strictEqual(result.blocks[dollarIdBlockId].value, 'nested-id')
    })

    it('should handle $null in arrays', function () {
      const data = {
        action_dispatch: {
          items: [1, '$null', 3]
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'nullarr',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const arrayBlock = Object.values(result.blocks).find(b => b.dataType === 'array')
      // Note: The current implementation doesn't filter $null from arrays
      // This test documents the actual behavior
      strictEqual(arrayBlock.blockValues.length, 3)
    })

    it('should handle $null in objects', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          value: '$null',
          other: 'keep'
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'nullobj',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      const dispatchBlock = result.blocks[result.blockSequences[0]]
      // $null creates a block with key but no value, so 3 blocks total
      strictEqual(dispatchBlock.blockValues.length, 3)

      const keys = dispatchBlock.blockValues.map(id => result.blocks[id].key)
      strictEqual(keys.includes('id'), true)
      strictEqual(keys.includes('value'), true)
      strictEqual(keys.includes('other'), true)

      // The value block should have no value
      const valueBlockId = dispatchBlock.blockValues.find(id => result.blocks[id].key === 'value')
      strictEqual(result.blocks[valueBlockId].value, undefined)
    })

    it('should handle deeply nested $refs', function () {
      const data = {
        action_dispatch: {
          level1: {
            level2: {
              level3: {
                $ref: 'deep-ref'
              }
            }
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'deepref',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.$refs.length, 1)
      strictEqual(result.$refs[0][1], 'deep-ref')
      strictEqual(result.blocks[result.$refs[0][0]].$ref, 'deep-ref')
    })

    it('should handle $sequenceRef in arrays', function () {
      const data = {
        action_dispatch: {
          items: [
            { $sequenceRef: 0 },
            { $sequenceRef: 1 }
          ]
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'seqarr',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.$sequenceRefs.length, 2)
      strictEqual(result.$sequenceRefs[0][1], 0)
      strictEqual(result.$sequenceRefs[1][1], 1)
    })

    it('should handle mixed $ref and $sequenceRef', function () {
      const data = {
        action_dispatch: {
          ref: { $ref: 'ref1' },
          seq: { $sequenceRef: 5 }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'mixed',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.$refs.length, 1)
      strictEqual(result.$sequenceRefs.length, 1)
      strictEqual(result.$refs[0][1], 'ref1')
      strictEqual(result.$sequenceRefs[0][1], 5)
    })

    it('should handle action_ifElse with complex conditions', function () {
      const methods = { action_ifElse: true }
      const uuid = {
        prefix: 'ifelse',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction([
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                left: 'value',
                right: 'active'
              },
              { andOr: '&&' },
              {
                op: '!=',
                left: 'status',
                right: 'disabled'
              }
            ],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        },
        {
          variable_getValue: '$null'
        },
        {
          variable_getValue: '$null'
        }
      ], methods, uuid)

      strictEqual(result.blockSequences.length, 1)
      // The method block has method property set to 'action_ifElse'
      ok(result.blocks[result.blockSequences[0]].ifElse)
      strictEqual(result.$sequenceRefs.length, 2)
    })

    it('should handle very large structures', function () {
      const items = []
      for (let i = 0; i < 50; i++) {
        items.push({ value: i })
      }

      const data = {
        action_dispatch: {
          items: items
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'large',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const blockCount = Object.keys(result.blocks).length
      strictEqual(blockCount > 50, true)

      const arrayBlock = Object.values(result.blocks).find(b => b.dataType === 'array')
      strictEqual(arrayBlock.blockValues.length, 50)
    })

    it('should handle unicode and special characters in values', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          message: 'Hello 世界 🌍',
          special: 'line\nbreak\ttab'
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'unicode',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      const messageBlock = Object.values(result.blocks).find(b => b.value === 'Hello 世界 🌍')
      strictEqual(messageBlock !== undefined, true)

      const specialBlock = Object.values(result.blocks).find(b => b.value === 'line\nbreak\ttab')
      strictEqual(specialBlock !== undefined, true)
    })

    it('should handle boolean and number edge cases', function () {
      const data = {
        action_dispatch: {
          boolTrue: true,
          boolFalse: false,
          zero: 0,
          negative: -1,
          float: 3.14,
          infinity: Infinity,
          nan: NaN
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'boolnum',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const dispatchBlock = result.blocks[result.blockSequences[0]]
      strictEqual(dispatchBlock.blockValues.length, 7)

      const blocks = Object.values(result.blocks)
      const trueBlock = blocks.find(b => b.value === true)
      const falseBlock = blocks.find(b => b.value === false)
      const zeroBlock = blocks.find(b => b.value === 0)
      const infBlock = blocks.find(b => b.value === Infinity)
      const nanBlock = blocks.find(b => isNaN(b.value))

      strictEqual(trueBlock !== undefined, true)
      strictEqual(falseBlock !== undefined, true)
      strictEqual(zeroBlock !== undefined, true)
      strictEqual(infBlock !== undefined, true)
      strictEqual(nanBlock !== undefined, true)
    })

    it('should handle undefined values (not $null)', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          value: undefined
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'undef',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      const dispatchBlock = result.blocks[result.blockSequences[0]]
      strictEqual(dispatchBlock.blockValues.length, 2)

      const valueBlock = Object.values(result.blocks).find(b => b.key === 'value')
      strictEqual(valueBlock.value, undefined)
    })

    it('should handle empty strings', function () {
      const data = {
        action_dispatch: {
          id: 'test',
          empty: ''
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'emptystr',
        increment: 0
      }

      const result = parseAction(data, methods, uuid)

      const emptyBlock = Object.values(result.blocks).find(b => b.key === 'empty')
      strictEqual(emptyBlock.value, '')
    })

    // Removed: $null is not related to null type
    // $null is used to indicate actions with no parameters

    it('should handle single property objects', function () {
      const data = {
        action_dispatch: {
          single: {
            value: 'only'
          }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'single',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const singleBlock = Object.values(result.blocks).find(b => b.key === 'single')
      strictEqual(singleBlock.dataType, 'object')
      strictEqual(singleBlock.blockValues.length, 1)
    })

    it('should handle deeply nested arrays', function () {
      const data = {
        action_dispatch: {
          matrix: [
            [1, 2],
            [3, 4],
            [[5, 6], [7, 8]]
          ]
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'matrix',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const arrayBlocks = Object.values(result.blocks).filter(b => b.dataType === 'array')
      strictEqual(arrayBlocks.length > 3, true)
    })

    it('should handle objects with same keys but different values', function () {
      const data = {
        action_dispatch: {
          obj1: { value: 'a' },
          obj2: { value: 'b' }
        }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'samekeys',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      const obj1Block = Object.values(result.blocks).find(b => b.key === 'obj1')
      const obj2Block = Object.values(result.blocks).find(b => b.key === 'obj2')

      strictEqual(obj1Block.blockValues.length, 1)
      strictEqual(obj2Block.blockValues.length, 1)

      const obj1Value = result.blocks[obj1Block.blockValues[0]]
      const obj2Value = result.blocks[obj2Block.blockValues[0]]

      strictEqual(obj1Value.value, 'a')
      strictEqual(obj2Value.value, 'b')
    })

    it('should preserve UUID state across multiple calls', function () {
      const data1 = {
        action_dispatch: { id: 'first' }
      }
      const data2 = {
        action_dispatch: { id: 'second' }
      }
      const data3 = {
        action_dispatch: { id: 'third' }
      }

      const methods = { action_dispatch: true }
      const uuid = {
        prefix: 'state',
        increment: 0
      }

      const result1 = parseAction(data1, methods, uuid)
      const result2 = parseAction(data2, methods, uuid)
      const result3 = parseAction(data3, methods, uuid)

      const ids1 = Object.keys(result1.blocks)
      const ids2 = Object.keys(result2.blocks)
      const ids3 = Object.keys(result3.blocks)

      strictEqual(ids1[0], 'state_1')
      strictEqual(ids2[0], 'state_3')
      strictEqual(ids3[0], 'state_5')
    })

    it('should handle complex real-world action sequence', function () {
      const data = {
        $id: 'user-registration',
        action_dispatch: {
          id: 'validate-form',
          payload: {
            fields: ['email', 'password'],
            rules: {
              email: {
                required: true,
                format: 'email'
              },
              password: { minLength: 8 }
            }
          }
        },
        action_ifElse: {
          if: [
            {
              op: '==',
              left: 'validationResult',
              right: 'pass'
            }
          ],
          then: [
            { $sequenceRef: 0 }
          ],
          else: [
            { $sequenceRef: 1 }
          ]
        },
        state_setValue: {
          name: 'registrationError',
          value: {
            $ref: 'error-message'
          }
        }
      }

      const methods = {
        action_dispatch: true,
        action_ifElse: true,
        state_setValue: true
      }
      const uuid = {
        prefix: 'real',
        increment: 0
      }
      // @ts-ignore
      const result = parseAction(data, methods, uuid)

      strictEqual(result.id, 'user-registration')
      strictEqual(result.blockSequences.length, 3)
      strictEqual(result.$refs.length, 1)
      strictEqual(result.$sequenceRefs.length, 2)

      const blockCount = Object.keys(result.blocks).length
      strictEqual(blockCount > 15, true)
    })
  })
})
