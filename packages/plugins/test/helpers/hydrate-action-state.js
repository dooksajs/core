import { stateSetValue } from '#core'

/**
 * @import {ActionCompileResult} from '@dooksa/create-action''@dooksa/create-action'
 */

/**
 * Helper function to seed action state data
 * @param {ActionCompileResult | ActionCompileResult[]} action
 */
export function hydrateActionState (action) {
  const actions = Array.isArray(action) ? action : [action]
  const sequences = {}
  const blocks = {}
  const blockSequences = {}

  for (const actionData of actions) {
    if (actionData.sequences) {
      Object.assign(sequences, { [actionData.sequenceId]: actionData.sequences })
    }

    if (actionData.blocks) {
      Object.assign(blocks, actionData.blocks)
    }

    if (actionData.blockSequences) {
      Object.assign(blockSequences, actionData.blockSequences)
    }
  }

  if (Object.keys(sequences).length) {
    stateSetValue({
      name: 'action/sequences',
      value: sequences,
      options: { merge: true }
    })
  }

  if (Object.keys(blocks).length) {
    stateSetValue({
      name: 'action/blocks',
      value: blocks,
      options: { merge: true }
    })
  }

  if (Object.keys(blockSequences).length) {
    stateSetValue({
      name: 'action/blockSequences',
      value: blockSequences,
      options: { merge: true }
    })
  }
}
