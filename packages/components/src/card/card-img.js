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
  options: {
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
