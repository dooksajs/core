import createAction from '@dooksa/create-action'

export default createAction('state-select-collection', [
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
    $id: 'component_select_collection_fieldset',
    variable_getValue: {
      query: 'state-select-collection-fieldset'
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
