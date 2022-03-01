
# Resource loader

Provides a convenient wrapper to add scripts or link ot the DOM

### Installation

```
$ npm install --save @dooksa/resource-loader
```

### Usage

To add a script

```js

import resource from '@dooksa/resource-loader'

resource.script({
  id: 'jquery-slim',
  src: 'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  integrity: 'sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj',
  crossOrigin: 'anonymous',
  globalVars: ['jQuery'],
  onSuccess: (result) => {
    console.log(result.jQuery)
  },
  onError: () => console.error('jQuery script failed')
})

```

To add some CSS

```js

import resource from '@dooksa/resource-loader'

resource.link({
  id: 'bootstrap',
  href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  integrity: 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3',
  crossOrigin: 'anonymous',
  onSuccess: () => console.log('Bootstrap successfully loaded'),
  onError: () => console.error('Bootstrap failed')
})

```