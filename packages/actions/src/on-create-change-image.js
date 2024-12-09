import createAction from '@dooksa/create-action'

export default createAction('on-create-change-image', [
  {
    state_setValue: {
      name: 'content/items',
      value: {
        src: 'https://picsum.photos/1024/768',
        alt: 'Scientists obtain \'lucky\' image of Jupiter'
      },
      options: {
        id: {
          action_getContextValue: 'contentId'
        }
      }
    }
  }
])




