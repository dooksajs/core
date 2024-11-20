import { base, extra, bootstrap } from '@dooksa/components'
import createApp from '@dooksa/create-app/client'
import plugins from '@dooksa/plugins/client'

export default createApp({
  plugins,
  components: [].concat(base, extra, bootstrap)
})
