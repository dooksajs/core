import createComponent from '@dooksa/create-component'

export default createComponent({
  id: 'card-img',
  tag: 'img',
  properties: [
    {
      name: 'src',
      value: 'https://picsum.photos/500/300'
    },
    {
      name: 'className',
      value: 'card-img-top'
    },
    {
      name: 'alt',
      value: ''
    }
  ],
  content: [
    {
      name: 'src',
      get: 'src',
      set: 'src'
    },
    {
      name: 'alt',
      get: 'alt',
      set: 'alt'
    }
  ],
  options: {
    src: {
      name: 'src'
    },
    position: {
      top: {
        name: 'className',
        value: 'card-img-top'
      },
      bottom: {
        name: 'className',
        value: 'card-img-bottom'
      }
    }
  }
})
