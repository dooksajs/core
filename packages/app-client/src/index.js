import componentBase from '@dooksa/component-base'
import componentExtra from '@dooksa/component-extra'
import componentBootstrap from '@dooksa/component-bootstrap'
import createApp from '@dooksa/create-app/client'
import plugins from '@dooksa/plugins'

const components = [].concat(componentBase, componentExtra, componentBootstrap)

export default createApp({
  plugins,
  components
})
