import {
  createDiv,
  createInputText,
  createLabel,
  createText
} from '@dooksa/component-base'

export default createDiv({
  metadata: { id: 'action-input-data-property-label' },
  children: [
    createLabel({
      children: [
        createText({ options: { value: 'Name' } })
      ],
      events: [
        {
          on: 'component/created',
          actionId: 'label-html-for'
        }
      ]
    }),
    createInputText({
      options: {
        name: 'object-property-name'
      },
      events: [
        {
          on: 'component/created',
          actionId: 'action-input-name-prefix-action'
        },
        {
          on: 'component/created',
          actionId: 'action-input-key'
        },
        {
          on: 'component/created',
          actionId: 'input-id'
        },
        {
          on: 'node/input',
          actionId: 'action-input-update-name'
        }
      ]
    })
  ]
})
