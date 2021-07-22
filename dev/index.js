import DsPlugins from '@dooksa/ds-plugins'

const plugins = new DsPlugins({ isDev: true })

// test adding multiple plugin metadata
plugins.addMetadata([
  ['dsTest', {
    version: '0.0.1'
  }]
])

// add test local plugin
plugins.use({
  name: 'dsTest',
  plugin: {
    name: 'dsTest',
    version: '0.0.1',
    data: {
      say: 'Hi',
      age: 0
    },
    methods: {
      /**
       * Updates age data value
       * @param {number} age - Age
       */
      addAge (age) {
        this.age = age
      },
      /**
       * promisePositiveNumber is a function that only accepts positive numbers
       * @param {number} number - positive number
       * @returns {Promise} - Resolves a positive number and rejects negatives
       */
      promisePositiveNumber (number) {
        return new Promise((resolve, reject) => {
          if (number > 0) {
            resolve(number)
          } else {
            const error = new Error('Promise no negative numbers!')

            reject(error)
          }
        })
      },
      /**
       * positiveNumber is a function that only accepts positive numbers
       * @param {number} number - positive number
       * @returns {number || Error} - a positive number or an Error if the number is negative
       */
      positiveNumber (number) {
        try {
          if (number > 0) {
            return number
          } else {
            throw new Error('No negative numbers!')
          }
        } catch (error) {
          return error
        }
      },
      /**
       * Say hello to someone and how old you are
       * @param {string} name
       * @returns A string
       */
      sayHi (name) {
        return `${this.say} ${name}! My age is ${this.age} years old.`
      }
    }
  },
  onDemand: false
})

// Run actions and display results
plugins.action('dsTest/addAge', '10')
plugins.action('dsTest/sayHi', 'John', {
  onSuccess: (r) => {
    const sayhi = document.querySelector('#data-sayhi')
    sayhi ? sayhi.append(`${r}`) : console.dir(sayhi)
  }
})

// TODO: [DS-438] Set input as a selectable number for positive number tests
plugins.action('dsTest/positiveNumber', 1, {
  onSuccess: (r) => {
    const posNumber = document.querySelector('#data-posnumber')
    posNumber ? posNumber.append(`${r}`) : console.dir(posNumber)
  },
  onError: (e) => {
    const posNumber = document.querySelector('#data-posnumber')
    posNumber ? posNumber.append(`${e}`) : console.dir(posNumber)
  }
})
plugins.action('dsTest/positiveNumber', -1, {
  onSuccess: (r) => {
    const posNumber = document.querySelector('#data-posnumber-error')
    posNumber ? posNumber.append(`${r}`) : console.dir(posNumber)
  },
  onError: (e) => {
    const posNumber = document.querySelector('#data-posnumber-error')
    posNumber ? posNumber.append(`${e}`) : console.dir(posNumber)
  }
})
plugins.action('dsTest/promisePositiveNumber', 1, {
  onSuccess: (r) => {
    const posNumber = document.querySelector('#data-promise-posnumber')
    posNumber ? posNumber.append(`${r}`) : console.dir(posNumber)
  },
  onError: (e) => {
    const posNumber = document.querySelector('#data-promise-posnumber')
    posNumber ? posNumber.append(`${e}`) : console.dir(posNumber)
  }
})
plugins.action('dsTest/promisePositiveNumber', -1, {
  onSuccess: (r) => {
    const posNumber = document.querySelector('#data-promise-posnumber-error')
    posNumber ? posNumber.append(`${r}`) : console.dir(posNumber)
  },
  onError: (e) => {
    const posNumber = document.querySelector('#data-promise-posnumber-error')
    posNumber ? posNumber.append(`${e}`) : console.dir(posNumber)
  }
})
// Use plugin callback onSuccess/onError method
const posNumber = document.querySelector('#data-promise-callbackmethod')

plugins.action('dsTest/promisePositiveNumber', 1, {
  onSuccess: {
    params: 'red',
    method: (r) => {
      posNumber.append(`${r.results}`)
    }
  },
  onError: {
    method: (e) => {
      console.dir(e)
      posNumber.append(`${e.results}`)
    }
  }
})

const posNumberError = document.querySelector('#data-promise-callbackmethod-error')

plugins.action('dsTest/promisePositiveNumber', -1, {
  onSuccess: {
    params: 'red',
    method: (r) => {
      posNumberError.append(`${r.results}`)
    }
  },
  onError: {
    method: (e) => {
      console.dir(e)
      posNumberError.append(`${e.results}`)
    }
  }
})
// TODO: [DS-439] fakeFunction e2e test
plugins.action('dsTest/fakeFunction', '10')
// TODO: [DS-440] direct methods e2e test
const sayHello = plugins.method('dsTest/sayHi', 'John')
const directHello = document.querySelector('#data-directhello-error')
directHello ? directHello.append(`${sayHello}`) : console.dir(sayHello)

plugins.callbackWhenAvailable('dsTest/sayHi', () => {
  const sayHello = plugins.method('dsTest/sayHi', 'John')
  console.log(`Safe run method result: ${sayHello}`)
  const directHello = document.querySelector('#data-directhello')
  directHello ? directHello.append(`Safe run method: ${sayHello}`) : console.dir(sayHello)
})
