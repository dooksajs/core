import createAction from '@dooksa/create-action'

export default createAction('icon-render', [
  {
    icon_render: {
      componentId: { action_getContextValue: 'id' }
    }
  }
])
