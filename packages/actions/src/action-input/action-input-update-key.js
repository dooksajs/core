import createAction from '@dooksa/create-action'

export default createAction('action-input-update-key', [
  {
    action_dispatch: {
      id: 'action-input-key',
      context: {
        action_getContextValue: '$null'
      }
    }
  },
  {
    data_addListener: {
      name: 'variable/values',
      id: { action_getContextValue: 'rootId' },
      handler: 'action-input-key'
    }
  }
])
