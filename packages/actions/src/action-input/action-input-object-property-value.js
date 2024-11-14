import createAction from '@dooksa/create-action'

export const actionInputObjectPropertyValue = createAction('action-input-object-property-value', [
  {
    variable_setValue: {
      scope: { action_getContextValue: 'rootId' },
      values: [
        {
          id: 'action-input-object-property',
          value: { action_getContextValue: 'id' }
        }
      ]
    }
  },
  {
    $id: 'action_input_value',
    variable_getValue: {
      query: 'action-input-value'
    }
  },
  {
    action_ifElse: {
      if: [
        {
          from: { $ref: 'action_input_value' },
          op: '!!'
        }
      ],
      then: [
        { $sequenceRef: 'data_type' },
        { $sequenceRef: 'process_data' }
      ],
      else: [{ $sequenceRef: 'process_schema' }]
    }
  },
  {
    $id: 'data_type',
    operator_eval: {
      name: 'typeof',
      values: [{ $ref: 'action_input_value' }]
    }
  },
  {
    $id: 'process_data',
    action_ifElse: {
      if: [
        {
          from: { $ref: 'data_type' },
          to: 'object',
          op: '=='
        },
        {
          andOr: '||'
        },
        {
          from: { $ref: 'data_type' },
          to: 'array',
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'process_data_object' }
      ],
      else: [
        { $sequenceRef: 'process_data_primitive' }
      ]
    }
  },
  {
    $id: 'process_data_object',
    list_map: {
      items: {
        $ref: 'action_input_value'
      },
      actionId: 'action-input-object-property-data'
    }
  },
  {
    $id: 'process_data_primitive',
    action_dispatch: {
      id: 'action-input-object-property-data',
      payload: {
        $ref: 'action_input_value'
      },
      context: {
        action_getContextValue: '$null'
      }
    }
  },
  {
    $id: 'process_schema',
    action_dispatch: {
      id: 'action-input-object-property-schema',
      payload: {
        action_getPayloadValue: '$null'
      },
      context: {
        action_getContextValue: '$null'
      }
    }
  }
])
