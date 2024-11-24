import app from '@dooksa/app/client'

const eventSource = new window.EventSource('/_/esbuild')

eventSource.addEventListener('rebuild', () => {
  window.location.reload()
})

app.setup()
