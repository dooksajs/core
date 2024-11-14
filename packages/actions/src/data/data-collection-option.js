import createAction from '@dooksa/create-action'

export const dataCollectionOption = createAction('data-collection-option', [
  {
    list_map: {
      actionId: 'data-collection-option-item',
      items: {
        action_getBlockValue: {
          value: { data_getValue: { name: 'data/collections' } },
          query: 'item'
        }
      }
    }
  }
])
