import componentBase from '@dooksa/component-base'
import componentExtra from '@dooksa/component-extra'
import componentBootstrap from '@dooksa/component-bootstrap'
import { createAppClient } from '@dooksa/create-app'
import plugins from '@dooksa/plugins'

const components = [].concat(componentBase, componentExtra, componentBootstrap)
export default createAppClient({
  plugins,
  components
})
