import {
  extendText, extendOption
} from '@dooksa/component-base'

export default extendOption({
  metadata: { id: 'option-variable-value' },
  children: [
    extendText({
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
