import createAction from '@dooksa/create-action'

export const iconRender = createAction('icon-render', [
  {
    icon_render: { action_getContextValue: 'id' }
  }
])
