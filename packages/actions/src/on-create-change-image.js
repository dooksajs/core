import createAction from '@dooksa/create-action'

export default createAction('on-create-change-image', [{
  set_dataValue: {
    name: 'content/items',
    value: {
      src: 'https://picsum.photos/1024/768',
      alt: 'Scientists obtain \'lucky\' image of Jupiter'
    },
    options: {
      id: {
        get_contextValue: 'contentId'
      }
    }
  }
}])
