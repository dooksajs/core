import { createIcon } from '#extra'
import {
  createSelect,
  createDiv,
  createOption,
  createText,
  createLabel
} from '@dooksa/components/base'
import labelRequiredStar from '../form/label-required-star.js'

export default createDiv({
  metadata: { id: 'state-select-collection' },
  children: [
    createLabel({
      children: [
        createIcon({
          options: {
            icon: 'mdi:folders',
            margin: [{
              direction: 'end',
              strength: '2'
            }]
          }
        }),
        createText({
          options: {
            value: 'Collections'
          }
        }),
        labelRequiredStar
      ],
      events: [
        {
          on: 'component/created',
          actionId: 'label-html-for'
        }
      ]
    }),
    createDiv({
      children: [
        createSelect({
          children: [
            createOption({
              children: [
                createText({
                  options: { value: '- Select collection -' }
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
              actionId: 'state-select-collection-options'
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
