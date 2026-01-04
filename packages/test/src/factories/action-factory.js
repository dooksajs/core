import createAction from '@dooksa/create-action'

/**
 * Creates a test action with the given steps
 *
 * @param {string} id - Action ID
 * @param {Array} steps - Action steps/steps
 * @param {Array} [dependencies=[]] - Action dependencies
 * @param {Object} [methods={}] - Allowed methods
 * @returns {Object} Compiled action
 *
 * @example
 * // Create a simple action
 * const action = createAction('test-action', [
 *   {
 *     $id: 'step1',
 *     variable_getValue: { query: 'data' }
 *   },
 *   {
 *     state_setValue: {
 *       name: 'result',
 *       value: { $ref: 'step1' }
 *     }
 *   }
 * ])
 */
export function createMockAction (id, steps, dependencies = [], methods = {}) {
  return createAction(id, steps, dependencies, methods)
}
