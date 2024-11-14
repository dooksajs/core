import { createLabel, createText } from '@dooksa/component-base'

export default createLabel({
  metadata: { id: 'action-input-data-action-label' },
  children: [
    createText({ options: { value: 'Action' } })
  ],
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})
