import { stateSetValue } from '#core'

/**
 * Helper function to seed action state data
 * @param {import('@dooksa/create-action').ActionCompileResult} action
 */
export function hydrateActionState (action) {
  stateSetValue({
    name: 'action/sequences',
    value: { [action.sequenceId]: action.sequences,
    options: { replace: true }
  })

  stateSetValue({
    name: 'action/blocks',
    value: action.blocks,
    options: { replace: true }
  })

  stateSetValue({
    name: 'action/blockSequences',
    value: action.blockSequences,
    options: { replace: true }
  })
}
