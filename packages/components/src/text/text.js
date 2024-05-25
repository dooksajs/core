import createComponent from '@dooksa/create-component'

export default createComponent({
  id: 'text',
  initialize: () => new Text(''),
  content: [
    {
      name: 'value',
      get: 'nodeValue',
      set: 'nodeValue'
    }
  ],
  options: {
    text: {
      name: 'nodeValue'
    }
  }
})
