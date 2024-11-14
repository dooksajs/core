import {
  createLabel,
  createText
} from '@dooksa/component-base'

export default createLabel({
  metadata: { id: 'action-input-data-text-label' },
  children: [
    createText({ options: { value: 'Value' } })
  ],
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})
