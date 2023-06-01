import resource from '../src'

resource.script({
  id: 'jquery-slim',
  src: 'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  integrity: 'sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj',
  crossOrigin: 'anonymous',
  globalVars: ['jQuery'],
  onSuccess: (result) => {
    console.log('jQuery loaded', result.jQuery)
  },
  onError: () => console.error('jQuery script failed')
})

resource.link({
  id: 'bootstrap',
  href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  integrity: 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3',
  crossOrigin: 'anonymous',
  onSuccess: () => console.log('Bootstrap successfully loaded'),
  onError: () => console.error('Bootstrap failed')
})