import createPlugin from '@dooksa/create-plugin'
import { $setDataValue, component } from '@dooksa/plugins'
import { $deleteDatabaseValue, $getDatabaseValue, $seedDatabase } from './database.js'
import { $setRoute } from './http.js'

/** @type {Function} */
let _$component = () => {}
/** @type {Function} */
let _$componentGetter = () => {}
/** @type {Function} */
let _$componentSetter = () => {}

const componentServer = createPlugin({
  name: 'component',
  models: component.models,
  components: component.components,
  actions: {
    $component (name) {
      const component = _$component(name)

      if (!component) {
        throw Error('No component found by the name of: ' + name)
      }

      // lazy load component
      if (component.isLazy && !component.isLoaded) {
        component.isLoaded = true

        component.lazy()
          .catch(e => console.error(e))
      }

      return component
    },
    $componentGetter (name) {
      return _$componentGetter(name)
    },
    $componentSetter (name) {
      return _$componentSetter(name)
    }
  },
  setup ({ component, componentGetter, componentSetter }) {
    _$component = component
    _$componentGetter = componentGetter
    _$componentSetter = componentSetter

    $setDataValue('component/items', {
      '0f64a9b82c6f98f7': {
        _item: { id: 'text' }
      },
      '43f4f4c34d66e648': {
        _item: { id: 'div' }
      }
    }, {
      merge: true
    })

    $seedDatabase('ds-component-items')

    // route: get a list of component
    $setRoute('/component', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['dsComponent/items'])
      ]
    })

    // route: delete component
    $setRoute('/component', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['dsComponent/items'])
      ]
    })
  }
})

const $component = componentServer.actions.$component
const $componentGetter = componentServer.actions.$componentGetter

export { $component, $componentGetter }

export default componentServer
