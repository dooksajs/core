import {
  createInputText,
  createLabel,
  createOption,
  createSelect,
  createText
} from '@dooksa/components/base'
import { createColumn, createRow } from '@dooksa/components/extra'

export default createRow({
  metadata: { id: 'action-input-data-string' },
  children: [
    createColumn({
      children: [
        createLabel({
          children: [
            createText({ options: { value: 'Value type' } })
          ],
          events: [
            {
              on: 'component/created',
              actionId: 'label-html-for'
            }
          ]
        }),
        createSelect({
          children: [
            createOption({
              children: [
                createText({ options: { value: 'Action' } })
              ],
              options: {
                value: 'action'
              }
            }),
            createOption({
              children: [
                createText({ options: { value: 'Context' } })
              ],
              options: {
                value: 'context'
              }
            }),
            createOption({
              children: [
                createText({ options: { value: 'Text' } })
              ],
              options: {
                value: 'text',
                selected: true
              }
            })
          ],
          options: {
            name: 'data-value-type'
          },
          events: [
            {
              on: 'component/created',
              actionId: 'action-input-name-prefix'
            },
            {
              on: 'component/created',
              actionId: 'input-id'
            },
            {
              on: 'node/input',
              actionId: 'action-input-data-type'
            }
          ]
        })
      ],
      options: {
        column: [
          { column: '12' },
          {
            column: '6',
            breakpoint: 'md'
          }
        ]
      }
    }),
    createColumn({
      children: [
        createLabel({
          children: [
            createText({ options: { value: 'Value' } })
          ],
          events: [
            {
              on: 'component/created',
              actionId: 'label-html-for'
            }
          ]
        }),
        createInputText({
          events: [
            {
              on: 'component/created',
              actionId: 'action-input-name-prefix-action-value'
            },
            {
              on: 'component/created',
              actionId: 'action-input-value'
            },
            {
              on: 'component/created',
              actionId: 'input-id'
            },
            {
              on: 'component/created',
              actionId: 'action-input-update-name-prefix-action-value'
            }
          ]
        })
      ],
      options: {
        column: [
          { column: '12' },
          {
            column: '6',
            breakpoint: 'md'
          }
        ]
      }
    })
  ],
  options: {
    gutter: [
      {
        direction: 'vertical',
        strength: '3'
      }
    ]
  }
})
