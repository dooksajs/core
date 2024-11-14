import {
  createSelect,
  createDiv,
  createOption,
  createText
} from '@dooksa/component-base'

export default createDiv({
  metadata: { id: 'data-collection-select' },
  children: [
    createSelect({
      children: [
        createOption({
          children: [
            createText({
              options: { value: 'Select collection' }
            })
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
    margin: [
      {
        direction: 'start',
        strength: '3'
      }
    ]
  }
})
