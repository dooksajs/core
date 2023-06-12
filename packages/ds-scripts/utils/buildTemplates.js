import parseAction from '@dooksa/parse-action'
import { uuid } from '@dooksa/crypto'

export default (html) => {
  const actionSequenceRef = {}
  const actions = {
    sequenceEntry: {},
    sequence: {},
    items: {}
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

        if (Object.prototype.hasOwnProperty.call(metadata.actions, key)) {
          const actionTemplates = metadata.actions[key]
          const sequenceId = uuid()

          actionSequenceRef[key] = sequenceId
          actions.sequenceEntry[sequenceId] = []

          for (let i = 0; i < actionTemplates.length; i++) {
            const actionTemplate = actionTemplates[i]
            const action = parseAction(actionTemplate)

            actions.sequenceEntry[sequenceId].push(action.sequenceId)
            actions.sequence[action.sequenceId] = action.sequence
            actions.items = { ...action.items, ...action.item }
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
