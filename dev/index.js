import DsPlugin from '@dooksa/ds-plugin'

const dsTest = {
  name: 'dsTest',
  version: '2',
  data: {
    text: 'hello'
  },
  methods: {
    sayHi (name) {
      return this.text + ' ' + name
    }
  }
}

const plugin = new DsPlugin(dsTest, [])

plugin.init()

const sayhi = document.querySelector('#data-sayhi')
sayhi.innerHTML = plugin.methods.sayHi('John')

// Test setup() coverage
const dsTestSetup = {
  name: 'dsTestSetup',
  version: '2',
  data: {
    text: 'Success'
  },
  setup: (params) => {
    return `${params} setup`
  }
}
const pluginSetup = new DsPlugin(dsTestSetup, [])

const setupResult = pluginSetup.init('Actioned: ')

const setup = document.querySelector('#data-setup')
setup.innerHTML = setupResult

// Test dependencies coverage
const dsTestDepend = {
  name: 'dsTestDepend',
  version: '2',
  data: {
    text: 'Success'
  },
  setup: (params) => {
    return `${params} setup`
  },
  dependencies: [
    {
      name: 'dsTestSetup',
      version: 2
    }]
}

const pluginDepend = new DsPlugin(dsTestDepend, [])

pluginDepend.init()
const depend = document.querySelector('#data-depends')
depend.innerHTML = pluginDepend.dependencies[0].name

// Test dispatch coverage
const dsTestDispatch = {
  name: 'dsTestDispatch',
  version: '2',
  data: {
    text: 'Dispatching Context'
  },
  setup: (params) => {
    return `${params} setup`
  }
}

const pluginDispatch = new DsPlugin(dsTestDispatch, [{
  name: 'isDev',
  value: () => {
    return 'Dispatched'
  },
  dispatch: true
}])

pluginDispatch.init()
const dispatch = document.querySelector('#data-dispatch')
dispatch.innerHTML = pluginDispatch._context.text
// context coverage
const pluginTest = new DsPlugin(dsTest, [{ name: 'isDev', value: true }])

pluginTest.init()

const value = document.querySelector('#data-value')
value.innerHTML = pluginTest._context.isDev ? 'Dev' : 'NotDev'

const dsTestGetters = {
  name: 'dsTestGetters',
  version: '2',
  data: {
    text: 'hello'
  },

  getters: {
    publicGetHeight () {
    // public getter
      const heights = [145, 134, 132, 142, 154]
      return heights[Math.floor(Math.random() * (heights.length - 1))]
    }
  }
}

const pluginGetters = new DsPlugin(dsTestGetters, [])

pluginGetters.init()

const getters = document.querySelector('#data-getters')
getters.innerHTML = pluginGetters.getters.publicGetHeight()
