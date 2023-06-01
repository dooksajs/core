
# Resource loader

Provides a convenient wrapper to add scripts or link to the DOM


### How to add script

Include the javascript file, the script file is located in the the [dist](https://bitbucket.org/dooksa/resource-loader/src/master/dist/) directory

```html

<script src="path/to/file/ds-resource.js>

```

### How to use script

```js

// add a script
window.dsResource.script({
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

// add a css file (link resource)
window.dsResource.link({
  id: 'bootstrap',
  href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  integrity: 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3',
  crossOrigin: 'anonymous',
  onSuccess: () => console.log('Bootstrap successfully loaded'),
  onError: () => console.error('Bootstrap failed')
})

```

### Installation using npm

```

$ npm install --save bitbucket:dooksa/resource-loader

```

### How to use with modules

To add a script

```js

import resource from '@dooksa/resource-loader'

// add a script
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

// add a css file (link resource)
resource.link({
  id: 'bootstrap',
  href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  integrity: 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3',
  crossOrigin: 'anonymous',
  onSuccess: () => console.log('Bootstrap successfully loaded'),
  onError: () => console.error('Bootstrap failed')
})

```

### Build

The script will be placed in the dist directory

```js

npm run build

```
