import createAction from '@dooksa/create-action'

export const actionAddBlockCollapse = createAction('action-add-block-collapse', [
  {
    state_setValue: {
      name: 'component/options',
      value: { open: false },
      options: {
        id: {
          variable_getValue: {
            query: 'component-id'
          }
        },
        merge: true
      }
    }
  }
])
