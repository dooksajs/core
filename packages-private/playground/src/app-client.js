import createApp from '@dooksa/create-app/client'

const app = createApp()
const eventSource = new window.EventSource('/_/esbuild')

eventSource.addEventListener('rebuild', () => {
  window.location.reload()
})

app.setup()
