import { createCardBody } from '@dooksa/component-extra'
import {
  createDiv, createInputText, createOption, createSelect, createText
} from '@dooksa/component-base'
import actionCardBodyLabelRequired from '../action-card/action-card-body-label-required.js'

const dataSelectorMethod = createDiv({
  children: [
    createSelect({
      children: [
        createOption({
          children: [
            createText({ options: { text: 'Select selection method' } })
          ],
          options: {
            selected: true,
            value: ''
          }
        }),
        createOption({
          children: [
            createText({ options: { text: 'Select list' } })
          ],
          options: { value: 'document-by-id' }
        }),
        createOption({
          children: [
            createText({ options: { text: 'Context value' } })
          ],
          options: { value: 'document-by-context' }
        }),
        createOption({
          children: [
            createText({ options: { text: 'Action result' } })
          ],
          options: { value: 'document-by-action' }
        })
      ],
      options: { required: true },
      events: [
        {
          on: 'component/created',
          actionId: 'input-id'
        },
        {
          on: 'node/input',
          actionId: 'data-set-value-by-id-update-fieldset'
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

const dataSelectorMethodContainer = createDiv({
  children: [
    createInputText({

    }),
    actionCardBodyLabelRequired,
    dataSelectorMethod
  ]
})

export default createCardBody({
  metadata: { id: 'data-set-value-by-id' },
  children: [dataSelectorMethodContainer],
  options: {
    displayGrid: 'always',
    gapRow: '2'
  },
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'data-document-select-method-label'
    },
    {
      on: 'component/beforeCreate',
      actionId: 'data-document-root-id'
    }
  ]
})
