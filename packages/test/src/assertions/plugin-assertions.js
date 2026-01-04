import { strictEqual, deepStrictEqual } from 'node:assert'

/**
 * @import {TestContext} from 'node:test'
 */

/**
 * Assert that an action was dispatched
 * @param {Object} mock - The mock plugin environment
 * @param {string} actionId - The action ID to check
 */
export function assertActionDispatched (mock, actionId) {
  const calls = mock.actionDispatch ? mock.actionDispatch.mock.calls : []
  const found = calls.some(call => call[0]?.id === actionId)

  if (!found) {
    throw new Error(`Action "${actionId}" was not dispatched`)
  }
}

/**
 * Assert that state was set with specific values
 * @param {Object} mock - The mock plugin environment
 * @param {string} name - State collection name
 * @param {string} id - State item ID
 * @param {Object} expectedValue - Expected state value
 */
export function assertStateSet (mock, name, id, expectedValue) {
  if (!mock.stateSetValue) {
    throw new Error('stateSetValue mock not found')
  }

  const calls = mock.stateSetValue.mock.calls
  const found = calls.find(call => {
    const [config] = call
    return config.name === name && config.options?.id === id
  })

  if (!found) {
    throw new Error(`State ${name} with id ${id} was not set`)
  }

  if (expectedValue) {
    const [config] = found
    deepStrictEqual(config.value, expectedValue)
  }
}

/**
 * Assert that state was not set
 * @param {Object} mock - The mock plugin environment
 * @param {string} name - State collection name
 * @param {string} id - State item ID
 */
export function assertStateNotSet (mock, name, id) {
  if (!mock.stateSetValue) {
    return // No calls means not set
  }

  const calls = mock.stateSetValue.mock.calls
  const found = calls.find(call => {
    const [config] = call
    return config.name === name && config.options?.id === id
  })

  if (found) {
    throw new Error(`State ${name} with id ${id} was set but should not have been`)
  }
}

/**
 * Assert that a method was called
 * @param {Object} mock - The mock plugin environment
 * @param {string} methodName - Method name to check
 * @param {*} expectedParam - Expected parameter (optional)
 */
export function assertMethodCalled (mock, methodName, expectedParam) {
  const method = mock[methodName]

  if (!method) {
    throw new Error(`Method "${methodName}" not found in mock`)
  }

  if (method.mock.calls.length === 0) {
    throw new Error(`Method "${methodName}" was not called`)
  }

  if (expectedParam !== undefined) {
    const calls = method.mock.calls
    const found = calls.some(call => {
      const [param] = call
      return deepStrictEqual(param, expectedParam) === undefined
    })

    if (!found) {
      throw new Error(`Method "${methodName}" was not called with expected parameters`)
    }
  }
}

/**
 * Assert that no methods were called
 * @param {Object} mock - The mock plugin environment
 */
export function assertNoMethodCalls (mock) {
  const methods = Object.keys(mock).filter(key => mock[key] && mock[key].mock && mock[key].mock.calls)

  const calledMethods = methods.filter(name => mock[name].mock.calls.length > 0)

  if (calledMethods.length > 0) {
    throw new Error(`Methods were called but should not have been: ${calledMethods.join(', ')}`)
  }
}

/**
 * Assert that a block has the correct structure
 * @param {Object} compiled - The compiled action
 * @param {Object} expected - Expected block structure
 */
export function assertBlockStructure (compiled, expected) {
  strictEqual(compiled.id, expected.id)
  strictEqual(compiled.sequences.length, expected.sequences)

  if (expected.blocks) {
    const blockIds = Object.keys(compiled.blocks)
    strictEqual(blockIds.length, expected.blocks)
  }
}
