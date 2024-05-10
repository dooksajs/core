import { objectHash } from '@dooksa/utils'

/**
 * @typedef {Object} ActionSequence - The sequence that will construct the final action
 * @property {string} id - Reference id to an action item
 * @property {Array.<string>} path - A list of keys related to the target object that is used to place the returned action value
 */

/**
 * @typedef {Object} Action
 * @property {Object.<string, ActionBlock>} action.items - Collection of actions
 * @property {ActionSequence[]} action.sequence - The sequence that will construct the final action
 */

/**
 * @typedef {Object} ActionBlock
 * @property {string} ActionBlock._$a - Action name
 * @property {(Object|Array|string|number)} ActionBlock._$arg - Action parameters
 */

/**
 * Convert template action to dsAction data
 * @param {Object} source
 * @param {Object} availableMethods - List of active methods
 * @returns {Action} - Data that can be used to set dsAction/items and dsAction/sequence
 */
export default (source, availableMethods) => {
  const actions = convertToActions(source, availableMethods)

  if (!actions.length) {
    return
  }

  const blocks = {}
  const sequences = []
  let children = []
  let depth = actions[0].path.length

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    const id = objectHash(action.source)
    const item = {
      path: action.path,
      id
    }
    let node = source

    if (depth !== action.path.length) {
      let split = false

      // check if child values belong to current action
      for (let i = 0; i < children.length; i++) {
        const childAction = actions[children[i]]

        // check if previous action belongs to the same parent action
        if (action.path.lastIndexOf('_$arg') !== childAction.path.lastIndexOf('_$arg')) {
          // check if actions belong to the same lineage
          for (let k = 0; k < action.path.length; k++) {
            const a = action.path[k]
            const b = childAction.path[k]

            if (a !== b) {
              children.splice(i, 1)
              break
            }
          }

          split = true
          break
        }
      }

      if (split && children.length) {
        item.children = children.slice()
        children = []
      }
    }

    // exclude own key
    const keyLength = action.path.length - 1

    for (let i = 0; i < keyLength; i++) {
      const key = action.path[i]

      node = node[key]
    }

    children.push(i)
    depth = action.path.length

    if (keyLength > -1) {
      node[action.path[keyLength]] = {
        _$dv: i
      }
    }

    sequences.push(item)

    blocks[id] = action.source
  }

  // update last sequence children
  const lastIndex = sequences.length - 1
  sequences[lastIndex].children = getLastSequenceChildren(sequences, lastIndex)

  const sequenceId = objectHash(sequences)

  return { blocks, sequences, sequenceId }
}

/**
 * Extract actions from action templates
 * @private
 * @param {Object} source - Action template
 * @param {Function} availableMethods - List of active methods
 * @param {Object} [node={ path: [] }]
 * @param {string[]} [node.path] - List of keys to assign to parent object
 * @param {Object[]} actions - Dooksa actions
 * @param {number} [lastNode] - Last key in object
 * @param {boolean} [isHead] - Indicates that the current possible is the root element
 * @returns {Object[]|Object}
 */
function convertToActions (
  source,
  availableMethods,
  node = { path: [] },
  actions = [],
  lastNode = 0,
  isHead = true
) {
  const keys = Object.keys(source)

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = source[key]

    // store current node split ⅄
    if (keys.length > 1) {
      lastNode = node.path.length
    }

    if (availableMethods(key)) {
      source._$a = key

      if (value != null && value !== '$noArgs') {
        if (Array.isArray(value)) {
          source._$arg = value.slice()
        } else if (typeof value === 'object') {
          source._$arg = Object.assign({}, value)
        } else {
          source._$arg = value
        }
      }

      delete source[key]

      actions.unshift({
        path: node.path.slice(),
        source
      })
    }

    if (typeof value === 'object') {
      node.path.push(key)

      const result = convertToActions(
        value,
        availableMethods,
        node,
        actions,
        lastNode,
        false
      )

      // clear keys up until last working node
      node.path = result.node.path.slice(0, lastNode)
    }
  }

  if (isHead) {
    return actions
  }

  return { actions, node }
}

/**
 * Get the last sequence children "data"
 * @param {ActionSequence} sequences - List of sequences
 * @param {number} length - Last index of sequence
 * @returns {Array}
 */
function getLastSequenceChildren (sequences, length) {
  const children = []

  for (let i = 0; i < length; i++) {
    const sequence = sequences[i]

    // check for nested functions and ignore
    if (sequence.path.indexOf('_$arg') === sequence.path.lastIndexOf('_$arg')) {
      children.push(i)
    }
  }

  return children
}
