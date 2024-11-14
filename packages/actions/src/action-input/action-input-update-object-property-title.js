import createAction from '@dooksa/create-action'

export const actionInputUpdateObjectPropertyTitle = createAction('action-input-update-object-property-title', [
  {
    action_dispatch: {
      id: 'action-input-object-property-name',
      context: {
        action_getContextValue: '$null'
      }
    }
  },
  {
    data_addListener: {
      name: 'variable/values',
      id: { action_getContextValue: 'rootId' },
      handler: 'action-input-object-property-name'
    }
  }
])
