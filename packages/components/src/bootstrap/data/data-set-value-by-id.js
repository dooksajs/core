import { createCardBody } from '@dooksa/components/extra'
import {
  createDiv,
  createOption,
  createSelect,
  createText
} from '@dooksa/components/base'
import actionCardBodyLabelRequired from '../action-card/action-card-body-label-required.js'
import actionInputMethodName from '../action-input/action-input-method-name.js'

export default createCardBody({
  metadata: { id: 'data-set-value-by-id' },
  children: [
    createDiv({
      children: [
        actionInputMethodName,
        actionCardBodyLabelRequired,
        createDiv({
          children: [
            createSelect({
              children: [
                createOption({
                  children: [
                    createText({ options: { value: 'Selection method' } })
                  ],
                  options: {
                    selected: true,
                    value: ''
                  }
                }),
                createOption({
                  children: [
                    createText({ options: { value: 'Document' } })
                  ],
                  options: { value: 'document-by-id' }
                }),
                createOption({
                  children: [
                    createText({ options: { value: 'Context' } })
                  ],
                  options: { value: 'document-by-context' }
                }),
                createOption({
                  children: [
                    createText({ options: { value: 'Action' } })
                  ],
                  options: { value: 'document-by-action' }
                })
              ],
              options: {
                required: true,
                name: 'select-method'
              },
              events: [
                {
                  on: 'component/created',
                  actionId: 'input-id'
                },
                {
                  on: 'component/created',
                  actionId: 'action-input-name-prefix'
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
                strength: '4'
              }
            ]
          }
        })
      ]
    })
  ],
  options: {
    display: [{
      type: 'grid'
    }],
    gapRow: '3'
  },
  events: [
    {
      on: 'component/beforeChildren',
      actionId: 'data-document-select-method-label'
    },
    {
      on: 'component/beforeChildren',
      actionId: 'variable-context-id'
    }
  ]
})
