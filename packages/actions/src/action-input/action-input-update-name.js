import createAction from '@dooksa/create-action'

export default createAction('action-input-update-name', [
  {
    $id: 'new_property_name',
    action_getPayloadValue: 'target.value'
  },
  {
    $id: 'property_name',
    variable_getValue: {
      query: 'action-input-key'
    }
  },
  {
    $id: 'action_property_name',
    variable_getValue: {
      query: 'action-input-name'
    }
  },
  {
    $id: 'replace_pattern',
    operator_eval: {
      name: '+',
      values: [
        { $ref: 'property_name' },
        '+$'
      ]
    }
  },
  {
    $id: 'regex_pattern',
    regex_pattern: {
      pattern: { $ref: 'replace_pattern' }
    }
  },
  {
    $id: 'action_input_name',
    string_replace: {
      value: { $ref: 'action_property_name' },
      pattern: { $ref: 'regex_pattern' },
      replacement: { $ref: 'new_property_name' }
    }
  },
  {
    variable_setValue: {
      values: [
        {
          id: 'action-input-key',
          value: { $ref: 'new_property_name' }
        },
        {
          id: 'action-input-name',
          value: { $ref: 'action_input_name' }
        }
      ]
    }
  }
])
