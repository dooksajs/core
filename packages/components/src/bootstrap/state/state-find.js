import { createDiv, createFieldset, createFormCheck, createInputRadio, createLabel, createLegend, createText } from '#base'
import { createCardBody, createIcon } from '#extra'
import actionInputMethodName from '../action-input/action-input-method-name.js'
import { labelRequiredStar } from '../form/index.js'

export default createCardBody({
  metadata: {
    id: 'state-find'
  },
  children: [
    createDiv({
      children: [
        actionInputMethodName,
        createFieldset({
          options: {
            display: [{ type: 'grid' }],
            gapRow: '3'
          },
          children: [
            createDiv({
              children: [
                createLegend({
                  children: [
                    createIcon({
                      options: {
                        icon: 'mdi:folder-search',
                        margin: [{
                          direction: 'end',
                          strength: '2'
                        }]
                      }
                    }),
                    createText({
                      options: {
                        value: 'Select collection name by'
                      }
                    }),
                    labelRequiredStar
                  ],
                  options: {
                    fontSize: '6'
                  }
                }),
                createFormCheck({
                  children: [
                    createLabel({
                      options: {
                        formCheck: true
                      },
                      children: [
                        createText({
                          options: {
                            value: 'Select list'
                          }
                        })
                      ],
                      events: [
                        {
                          on: 'component/created',
                          actionId: 'label-html-for'
                        }
                      ]
                    }),
                    createInputRadio({
                      options: {
                        name: 'select-collection',
                        checked: true,
                        value: 'select-list'
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
                          actionId: 'state-select-collection-on-checked'
                        }
                      ]
                    })
                  ],
                  options: {
                    inline: true,
                    margin: [
                      {
                        strength: '4',
                        direction: 'start'
                      }
                    ]
                  }
                }),
                createFormCheck({
                  children: [
                    createLabel({
                      options: {
                        formCheck: true
                      },
                      children: [
                        createText({
                          options: {
                            value: 'Action list'
                          }
                        })
                      ],
                      events: [
                        {
                          on: 'component/created',
                          actionId: 'label-html-for'
                        }
                      ]
                    }),
                    createInputRadio({
                      options: {
                        name: 'select-collection',
                        value: 'action-list'
                      },
                      events: [
                        {
                          on: 'component/created',
                          actionId: 'input-id'
                        },
                        {
                          on: 'component/created',
                          actionId: 'action-input-name-prefix'
                        }
                      ]
                    })
                  ],
                  options: {
                    inline: true
                  }
                })
              ]
            })
          ],
          events: [
            {
              on: 'component/beforeChildren',
              actionId: 'state-select-collection-fieldset'
            },
            {
              on: 'component/created',
              actionId: 'state-select-collection'
            }
          ]
        })
      ]
    })
  ],
  events: [
    {
      on: 'component/beforeChildren',
      actionId: 'variable-context-id'
    }
  ]
})
