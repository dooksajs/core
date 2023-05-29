import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'gz6gvx',
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false
  }
})
