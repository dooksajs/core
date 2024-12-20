import {
  createSelect,
  createDiv,
  createOption,
  createText
} from '@dooksa/components/base'

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
      options: {
        name: 'name',
        required: true
      },
      events: [
        {
          on: 'component/created',
          actionId: 'input-id'
        },
        {
          on: 'component/created',
          actionId: 'action-input-name-prefix-action'
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
        strength: '4'
      }
    ]
  }
})
