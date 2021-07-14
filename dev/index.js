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
       * promisePositiveNumber is a function that only accepts positive numbers
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

// Run actions
plugins.action('dsTest/addAge', '10')
plugins.action('dsTest/sayHi', 'John', { onSuccess: (r) => console.log(r) })
plugins.action('dsTest/positiveNumber', 1, { onSuccess: (r) => console.log(r) })
plugins.action('dsTest/positiveNumber', -1, { onSuccess: (r) => console.log(r), onError: (e) => console.error(e) })
plugins.action('dsTest/promisePositiveNumber', 1, { onSuccess: (r) => console.log(r), onError: (e) => console.error(e) })
plugins.action('dsTest/promisePositiveNumber', -1, { onSuccess: (r) => console.log(r), onError: (e) => console.error(e) })
plugins.action('dsTest/fakeFunction', '10')

// Run direct methods
const sayHello = plugins.method('dsTest/sayHi', 'John')
console.log(`Unsafe run method result: ${sayHello}`)

plugins.callbackWhenAvailable('dsTest/sayHi', () => {
  const sayHello = plugins.method('dsTest/sayHi', 'John')
  console.log(`Safe run method result: ${sayHello}`)
})
