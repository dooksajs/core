import loader from '@dooksa/script-loader'

const t0 = performance.now()
loader.script({
  id: 'jquery-slim',
  src: 'https://code.jquery.com/jquery-3.5.1.slim.min.js',
  integrity: 'sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj',
  crossOrigin: 'anonymous',
  globalVars: ['jQuery'],
  onSuccess: (result) => {
    const t1 = performance.now()
    console.log(`Call to cache took ${t1 - t0} milliseconds.`)
    console.log(result)
  }
})

loader.script({
  id: 'bo-slim',
  src: 'https://cdn.jsdelivr.net/npm/@popperjs/core@2.10.2/dist/umd/popper.min.js',
  globalVars: ['popper'],
  onSuccess: (result) => {
    const t1 = performance.now()
    console.log(`Call to cache took ${t1 - t0} milliseconds.`)
    console.log(result)
  }
})

loader.resource({
  id: 'bootstrap',
  href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
  integrity: 'sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3',
  crossOrigin: 'anonymous',
  onSuccess: (result) => {
    const t1 = performance.now()
    console.log(`Call to cache took ${t1 - t0} milliseconds.`)
    console.log(result)
  }
})

loader.resource({
  id: 'ds-bootstrap',
  href: 'https://cdn.dooksa.com/file/dooksa/assets/css/bootstrap.min.css',
  onSuccess: (result) => {
    const t1 = performance.now()
    console.log(`Call to cache took ${t1 - t0} milliseconds.`)
    console.log(result)
  }
})
