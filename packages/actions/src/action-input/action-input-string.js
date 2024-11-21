import createAction from '@dooksa/create-action'

export const actionInputString = createAction('action-input-string', [
  {
    $id: 'action_input_data_string',
    data_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-data-string',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_data_string_id',
    action_getBlockValue: {
      value: { $ref: 'action_input_data_string' },
      query: 'id'
    }
  },
  {
    data_setValue: {
      name: 'component/children',
      value: { $ref: 'action_input_data_string_id' },
      options: {
        id: { action_getContextValue: 'id' },
        update: {
          method: 'push'
        }
      }
    }
  }
])
