import createAction from '@dooksa/create-action'

export const iconRender = createAction('icon-render', [
  {
    icon_render: {
      componentId: { action_getContextValue: 'id' }
    }
  }
])
