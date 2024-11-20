import {
  createSelect,
  createDiv,
  createText,
  createOption
} from '@dooksa/components/base'
import actionCardBodyLabelRequired from '../action-card/action-card-body-label-required.js'

export default createDiv({
  metadata: { id: 'data-document-select' },
  children: [
    actionCardBodyLabelRequired,
    createDiv({
      children: [
        createSelect({
          children: [
            createOption({
              children: [
                createText({ options: { value: 'Select document' } })
              ],
              options: {
                selected: true,
                value: ''
              }
            })
          ],
          options: {
            name: 'options.id',
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
              actionId: 'data-document-option'
            },
            {
              on: 'node/input',
              actionId: 'data-document-value'
            }
          ]
        })
      ],
      options: {
        margin: [{
          direction: 'start',
          strength: '4'
        }],
        display: [{
          type: 'grid'
        }],
        gap: '3'
      }
    })
  ]
})

