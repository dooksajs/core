describe('default test run, using dev webpack of ds-plugins', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081/')
  })
  it('run for coverage results of example tests', () => {
    cy.get('script').should('contain', 'main')
  })
})
