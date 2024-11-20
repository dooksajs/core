import { createText, createOption } from '@dooksa/components/base'

export default createOption({
  metadata: { id: 'option-variable-value' },
  children: [
    createText({
      events: [
        {
          on: 'component/created',
          actionId: 'option-text'
        }
      ]
    })
  ],
  events: [
    {
      on: 'component/created',
      actionId: 'option-value'
    }
  ]
})
