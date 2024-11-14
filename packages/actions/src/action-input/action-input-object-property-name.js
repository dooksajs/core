import createAction from '@dooksa/create-action'

export const actionInputObjectPropertyName = createAction('action-input-object-property-name', [
  {
    $id: 'value',
    variable_getValue: {
      query: 'action-input-title'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 'value' },
          op: '!!'
        }
      ],
      then: [{ $sequenceRef: 'update_component_option' }],
      else: []
    }
  },
  {
    $id: 'update_component_option',
    data_setValue: {
      name: 'component/options',
      value: {
        value: { $ref: 'value' }
      },
      options: {
        id: { action_getContextValue: 'id' },
        merge: true
      }
    }
  }
])
