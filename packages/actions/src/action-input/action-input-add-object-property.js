import createAction from '@dooksa/create-action'

export default createAction('action-input-add-object-property', [
  {
    $id: 'action_input_object_property_children',
    variable_getValue: {
      scope: { action_getContextValue: 'rootId' },
      query: 'action-input-object-property'
    }
  },
  {
    $id: 'action_input_object_property',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'action-input-object-property',
        isTemplate: true
      }
    }
  },
  {
    $id: 'action_input_object_property_id',
    action_getValue: {
      value: { $ref: 'action_input_object_property' },
      query: 'id'
    }
  },
  { // set input values to "local scope"
    variable_setValue: {
      scope: { $ref: 'action_input_object_property_id' },
      values: [
        {
          id: 'action-input-root-id',
          value: { $ref: 'action_input_object_property_id' }
        },
        {
          id: 'action-input-value',
          value: ''
        },
        {
          id: 'action-input-name',
          value: ''
        },
        {
          id: 'action-input-key',
          value: ''
        }
      ]
    }
  },
  {
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'action_input_object_property_id' },
      options: {
        id: { $ref: 'action_input_object_property_children' },
        update: {
          method: 'push'
        }
      }
    }
  }
])
