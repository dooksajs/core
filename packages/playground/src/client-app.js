import app from '@dooksa/client'

((data) => {
  const eventSource = new window.EventSource('/_/esbuild')

  eventSource.addEventListener('rebuild-client', () => {
    window.location.reload()
  })

  eventSource.addEventListener('rebuild-server', () => {
    window.location.reload()
  })

  app.setup({ data })

// @ts-ignore
})(__ds__)
