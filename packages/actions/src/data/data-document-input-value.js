import createAction from '@dooksa/create-action'

export default createAction('data-document-input-value', [
  {
    state_getValue: {
      name: {
        variable_getValue: {
          scope: { action_getContextValue: 'groupId' },
          query: 'data-document-collection'
        }
      },
      id: {
        variable_getValue: {
          scope: { action_getContextValue: 'groupId' },
          query: 'data-document-id'
        }
      }
    }
  },
  {
    state_setValue: {
      name: 'component/options',
      value: {
        value: {
          action_getBlockValue: {
            value: {
              $ref: 0
            },
            query: 'item'
          }
        }
      },
      options: {
        id: {
          action_getContextValue: 'id'
        },
        merge: true
      }
    }
  }
])
