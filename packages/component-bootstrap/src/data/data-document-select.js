import {
  extendSelect,
  extendDiv,
  extendText,
  extendOption
} from '@dooksa/component-base'

export default extendDiv({
  metadata: { id: 'data-document-select' },
  children: [
    extendSelect({
      children: [
        extendOption({
          children: [
            extendText({ options: { text: 'Select document' } })
          ],
          options: {
            selected: true,
            value: ''
          }
        })
      ],
      options: { required: true },
      events: [
        {
          on: 'component/created',
          actionId: 'input-id'
        },
        {
          on: 'component/created',
          actionId: 'data-document-option'
        },
        {
          on: 'node/input',
          actionId: 'data-document-set-fieldset'
        }
      ]
    })
  ],
  options: {
    margin: [{
      direction: 'start',
      strength: '3'
    }]
  }
})
