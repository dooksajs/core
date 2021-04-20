import DsPlugins from '@dooksa/ds-plugins'
import { name, version } from '../ds.plugin.config'
import dsParameters from 'plugin'

const plugins = new DsPlugins({ isDev: true })

// add plugin metadata
plugins.addMetadata({
  [name]: {
    currentVersion: version,
    items: {
      [version]: {
        core: true
      }
    }
  }
})

console.log(dsParameters)
// use plugin
plugins.use({ name, plugin: dsParameters })
console.log(plugins)
// {
//   metadata: {
//     c123: [{
//       id: 'tooken'
//     }]
//   },
//   events: {
//     tooken: {
//       content_token: true
//     }
//   },
//   actions: {
//     tooken: [
//       {
//         type: 'pluginMethod',
//         name: 'dsTokens/replace',
//         computedParams: true,
//         paramType: 'object',
//         params: [
//           ['data', {
//             _$computed: true,
//             getter: 'this/value'
//           }],
//           ['rules', [
//             {
//               actions: [
//                 {
//                   type: 'getter',
//                   name: 'site/getTitle'
//                 }
//               ]
//             }
//           ]]
//         ]
//       }
//     ]
//   }
// }
