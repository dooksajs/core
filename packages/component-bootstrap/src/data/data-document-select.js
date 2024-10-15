import {
  createSelect,
  createDiv,
  createText,
  createOption
} from '@dooksa/component-base'

export default createDiv({
  metadata: { id: 'data-document-select' },
  children: [
    createSelect({
      children: [
        createOption({
          children: [
            createText({ options: { text: 'Select document' } })
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


const data = {
  name: 'john'
}
