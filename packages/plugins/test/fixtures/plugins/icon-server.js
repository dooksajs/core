import { createPlugin } from '@dooksa/create-plugin'
import { serverSetRoute } from '#server'

const iconServer = createPlugin('icon-server', {
  setup () {
    serverSetRoute({
      path: '/:prefix.json',
      suffix: '',
      handlers: [
        (req, res) => {
          const { prefix } = req.params
          // @ts-ignore
          const icons = (req.query.icons || '').split(',')

          if (prefix === 'error') {
            return res.status(500).json({ error: 'Internal Server Error' })
          }

          if (prefix === 'missing') {
            return res.status(404).json(404)
          }

          const response = {
            prefix,
            icons: {},
            aliases: {}
          }

          icons.forEach(icon => {
            if (icon === 'not-found') {
              return
            }

            if (icon === 'alias-icon') {
              response.aliases[icon] = {
                parent: 'original-icon'
              }
              // We don't necessarily need to return the original icon in the same response
              // unless the client expects it. The client code checks response.icons[iconName].
              // If alias, iconName becomes parent. So we should include parent.
              response.icons['original-icon'] = {
                body: '<path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>',
                width: 24,
                height: 24
              }
            } else {
              response.icons[icon] = {
                body: '<path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"/>',
                width: 24,
                height: 24
              }
            }
          })

          res.json(response)
        }
      ]
    })
  }
})

export { iconServer }

export default iconServer
