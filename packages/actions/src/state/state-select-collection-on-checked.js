import createAction from '@dooksa/create-action'

export default createAction('state-select-collection-on-checked', [
  {
    $id: 'component_select_collection_fieldset',
    variable_getValue: {
      query: 'state-select-collection-fieldset'
    }
  },
  {
    $id: 'fieldset_children',
    state_getValue: {
      name: 'component/children',
      id: { $ref: 'component_select_collection_fieldset' },
      options: {
        position: '1'
      }
    }
  },
  {
    $id: 'fieldset_children_id',
    action_getValue: {
      value: { $ref: 'fieldset_children' },
      query: 'item'
    }
  },
  {
    $id: 'if_fieldset_has_children',
    action_ifElse: {
      if: [
        {
          left: { $ref: 'fieldset_children_id' },
          op: '!'
        }
      ],
      then: [
        { $sequenceRef: 'radio_check' }
      ],
      else: [
        { $sequenceRef: 'fieldset_children_item' },
        { $sequenceRef: 'fieldset_children_value' },
        { $sequenceRef: 'if_select_collection' }
      ]
    }
  },
  {
    $id: 'fieldset_children_item',
    state_getValue: {
      name: 'component/items',
      id: { $ref: 'fieldset_children_id' }
    }
  },
  {
    $id: 'fieldset_children_value',
    action_getValue: {
      value: { $ref: 'fieldset_children_item' },
      query: 'item.id'
    }
  },
  {
    $id: 'if_select_collection',
    action_ifElse: {
      if: [
        {
          left: { $ref: 'fieldset_children_value' },
          right: 'state-select-collection',
          op: '!='
        }
      ],
      then: [
        { $sequenceRef: 'radio_check' }
      ],
      else: []
    }
  },
  {
    $id: 'radio_check',
    action_ifElse: {
      if: [
        {
          left: {
            action_getPayloadValue: 'target.checked'
          },
          right: true,
          op: '=='
        }
      ],
      then: [
        { $sequenceRef: 'component_select_collection' },
        { $sequenceRef: 'component_select_collection_id' },
        { $sequenceRef: 'set_component_select_collection_fieldset' }
      ],
      else: []
    }
  },
  {
    $id: 'component_select_collection',
    state_setValue: {
      name: 'component/items',
      value: {
        id: 'state-select-collection',
        isTemplate: true
      }
    }
  },
  {
    $id: 'component_select_collection_id',
    action_getValue: {
      value: { $ref: 'component_select_collection' },
      query: 'id'
    }
  },
  {
    $id: 'set_component_select_collection_fieldset',
    state_setValue: {
      name: 'component/children',
      value: { $ref: 'component_select_collection_id' },
      options: {
        id: { $ref: 'component_select_collection_fieldset' },
        update: {
          method: 'splice',
          startIndex: 1,
          deleteCount: 1
        }
      }
    }
  }
])
