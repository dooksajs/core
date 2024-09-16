import { extendDiv, extendForm } from '@dooksa/component-base'

const formContainer = extendDiv({
  events: [{
    on: 'component/create',
    actionId: 'action-editor-add-button-condition'
  },
  {
    on: 'component/childrenBeforeUpdate',
    actionId: 'action-editor-add-button-condition'
  }]
})

const form = extendForm({
  children: [formContainer]
})


export default extendDiv({
  metadata: {
    id: 'action-editor-container'
  },
  children: [form],
  options: {
    container: 'always',
    displayGrid: 'always',
    gapRow: '3'
  }
})
