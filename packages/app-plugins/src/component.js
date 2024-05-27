import createPlugin from '@dooksa/create-plugin'
import { $getDataValue, $setDataValue } from './data.js'

const component = createPlugin({
  name: 'component',
  data: {
    p: 1
  },
  actions: {
    blu () {
      this
    },
    /**
   * do something
   * @param {Object} param
   * @param {Function} param.getComponent
   */
    red () {
    }
  }
})

component.actions



export default component


