import {
  createText, createOption
} from '@dooksa/component-base'

export default createOption({
  metadata: { id: 'option-variable-value' },
  children: [
    createText({
      events: [
        {
          on: 'component/beforeCreate',
          actionId: 'option-text'
        }
      ]
    })
  ],
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'option-value'
    }
  ]
})
