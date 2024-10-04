import {
  extendSelect,
  extendDiv,
  extendOption,
  extendText
} from '@dooksa/component-base'

export default extendDiv({
  metadata: { id: 'data-collection-select' },
  children: [
    extendSelect({
      children: [
        extendOption({
          children: [
            extendText({ options: { text: 'Select collection' } })
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
          actionId: 'data-collection-option'
        },
        {
          on: 'node/input',
          actionId: 'data-document-set-select'
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
