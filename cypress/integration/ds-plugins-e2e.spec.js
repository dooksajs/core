describe('ds-plugins e2e test run, using dev webpack', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081/')
  })
  it('is the right script name built', () => {
    cy.get('script').should('contain', 'main')
  })
})
