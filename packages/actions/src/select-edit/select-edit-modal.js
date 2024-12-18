import createAction from '@dooksa/create-action'

export default createAction('select-edit-modal', [
  {
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'modal-section-edit',
        isTemplate: true
      }
    }
  },
  {
    action_getValue: {
      value: {
        $ref: 0
      },
      query: 'id'
    }
  },
  {
    variable_setValue: {
      id: {
        $ref: 1
      },
      values: [
        {
          id: 'componentId',
          value: {
            variable_getValue: {
              scope: {
                action_getContextValue: 'rootId'
              },
              query: 'componentId'
            }
          }
        }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: {
        $ref: 1
      },
      options: {
        id: 'root',
        update: {
          method: 'unshift'
        }
      }
    }
  },
  {
    bootstrapModal_create: {
      id: {
        $ref: 1
      }
    }
  },
  {
    bootstrapModal_show: {
      id: {
        $ref: 1
      }
    }
  }
])
