import parseAction from '@dooksa/parse-action'
import { uuid } from '@dooksa/crypto'

export default (html) => {
  const actionSequenceRef = {}
  const actions = {
    items: {},
    sequences: {},
    blocks: {}
  }
  let elements = []

  for (let i = 0; i < html.length; i++) {
    const rootElement = document.createElement('div')

    // prepare template
    rootElement.innerHTML = html[i]

    // fetch script tag
    const templateScript = rootElement.querySelector('script')

    // check if script exists
    if (!templateScript) {
      console.error('Template is missing <script> tag')
      break
    }

    // execute script
    const metadata = new Function(templateScript.textContent)() // eslint-disable-line

    // setup any actions
    if (metadata.actions) {
      const actionKeys = Object.keys(metadata.actions)

      for (let i = 0; i < actionKeys.length; i++) {
        const key = actionKeys[i]

        if (Object.hasOwn(metadata.actions, key)) {
          const actionTemplates = metadata.actions[key]
          const sequenceId = uuid()

          actionSequenceRef[key] = sequenceId
          actions.items[sequenceId] = []

          for (let i = 0; i < actionTemplates.length; i++) {
            const actionTemplate = actionTemplates[i]
            const action = parseAction(actionTemplate)

            actions.items[sequenceId].push(action.sequenceId)
            actions.sequences[action.sequenceId] = action.sequences
            actions.blocks = Object.assign(actions.blocks, action.blocks)
          }
        }
      }
    }

    // add template elements
    elements = rootElement.querySelectorAll('template')
  }

  return {
    actions,
    actionSequenceRef,
    elements
  }
}
