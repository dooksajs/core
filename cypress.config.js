import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'gz6gvx',
  e2e: {
    baseUrl: 'http://localhost:1337',
    supportFile: false
  }
})
