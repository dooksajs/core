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
            const error = new Error('Promise no non-positive numbers!')

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
            throw new Error('No non-positive numbers!')
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
// let posnumber
const inputNumber = document.querySelector('#posnumber')
inputNumber.addEventListener('input', (event) => {
  // eslint-disable-next-line
  plugins.action('dsTest/positiveNumber', posnumber.value, {
    onSuccess: (r) => {
      const posNumber = document.querySelector('#data-posnumber')
      posNumber.innerHTML = `${r}`
    },
    onError: (e) => {
      const posNumber = document.querySelector('#data-posnumber')
      posNumber.innerHTML = `${e}`
    }
  })
  // eslint-disable-next-line
  plugins.action('dsTest/promisePositiveNumber', posnumber.value, {
    onSuccess: (r) => {
      const posNumber = document.querySelector('#data-promise-posnumber')
      posNumber.innerHTML = `${r}`
    },
    onError: (e) => {
      const posNumber = document.querySelector('#data-promise-posnumber')
      posNumber.innerHTML = `${e}`
    }
  })
  // eslint-disable-next-line
plugins.action('dsTest/promisePositiveNumber', posnumber.value, {
    onSuccess: {
      params: ['red'],
      method: (r) => {
        const posNumber = document.querySelector('#data-promise-callbackmethod')
        posNumber.innerHTML = `${r.results}`
      }
    },
    onError: {
      method: (e) => {
        console.dir(e)
        const posNumber = document.querySelector('#data-promise-callbackmethod')
        posNumber.innerHTML = `${e.results}`
      }
    }
  })
})

// Use plugin callback onSuccess/onError method
// TODO: [DS-439] fakeFunction e2e test
plugins.action('dsTest/fakeFunction', '10')

const sayHello = plugins.method('dsTest/sayHi', 'John')
const directHello = document.querySelector('#data-directhello-error')
directHello.innerHTML = `${sayHello}`

plugins.callbackWhenAvailable('dsTest/sayHi', () => {
  const sayHello = plugins.method('dsTest/sayHi', 'John')
  console.log(`Safe run method result: ${sayHello}`)
  const directHello = document.querySelector('#data-directhello')
  directHello.innerHTML = `Safe run method: ${sayHello}`
})
