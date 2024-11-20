import {
  createLabel,
  createText
} from '@dooksa/components/base'

export default createLabel({
  metadata: { id: 'action-input-data-context-label' },
  children: [
    createText({ options: { value: 'Context' } })
  ],
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})
