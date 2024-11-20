import { createText, createDiv, createButton, createCode } from '@dooksa/components/base'
import { createCard, createCardBody, createCardHeader, createIcon } from '@dooksa/components/extra'

export default createCard({
  metadata: {
    id: 'action-input-array-item'
  },
  children: [
    createCardHeader({
      children: [
        // item title
        createDiv({
          children: [
            createText({
              options: {
                value: 'Item ['
              }
            }),
            createCode({
              children: [
                createText({
                  events: [
                    {
                      on: 'component/created',
                      actionId: 'action-input-key'
                    },
                    {
                      on: 'component/created',
                      actionId: 'action-input-update-key'
                    }
                  ]
                })
              ]
            }),
            createText({
              options: {
                value: ']'
              }
            })
          ]
        }),
        // item navigation
        createDiv({
          children: [
            createButton({
              children: [
                createIcon({
                  options: {
                    icon: 'mdi:chevron-up'
                  }
                })
              ],
              options: {
                btnVariant: 'light',
                btnSize: 'sm',
                rounded: 'circle'
              }
            }),
            createButton({
              children: [
                createIcon({
                  options: {
                    icon: 'mdi:chevron-down'
                  }
                })
              ],
              options: {
                btnVariant: 'light',
                btnSize: 'sm',
                rounded: 'circle'
              }
            }),
            createButton({
              children: [
                createIcon({
                  options: {
                    icon: 'mdi:close'
                  }
                })
              ],
              options: {
                btnVariant: 'light',
                btnSize: 'sm',
                rounded: 'circle'
              }
            })
          ],
          options: {
            margin: [{
              direction: 'start',
              strength: 'auto'
            }]
          }
        })
      ],
      options: {
        display: [{
          type: 'flex'
        }],
        alignItems: [{
          position: 'center'
        }]
      }
    }),
    createCardBody({
      options: {
        display: [{
          type: 'grid'
        }],
        gapRow: '3'
      },
      events: [
        {
          on: 'component/created',
          actionId: 'action-input-data'
        }
      ]
    })
  ]
})
