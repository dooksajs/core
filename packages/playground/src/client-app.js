import app from '@dooksa/client'

const eventSource = new window.EventSource('/_/esbuild')

eventSource.addEventListener('rebuild-client', () => {
  window.location.reload()
})

eventSource.addEventListener('rebuild-server', () => {
  window.location.reload()
})

app.setup()

