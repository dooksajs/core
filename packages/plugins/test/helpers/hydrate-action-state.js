import { stateSetValue } from '#core'

/**
 * @import {Action} from '@dooksa/create-action'
 */

/**
 * Helper function to seed action state data
 * @param {Action | Action[]} action
 */
export function hydrateActionState (action) {
  const actions = Array.isArray(action) ? action : [action]
  const sequences = {}
  const blocks = {}
  const blockSequences = {}

  for (const actionData of actions) {
    // Attempt to find ID if sequenceId is missing (createAction returns id, not sequenceId)
    const id = actionData.id

    if (actionData.sequences && id) {
      Object.assign(sequences, { [id]: actionData.sequences })
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
