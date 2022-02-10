describe('ds-plugins e2e test run, using dev webpack', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081/')
  })
  it('is the right script name built', () => {
    cy.get('script').should('contain', 'main')
  })
  it('sayHi() displays in HTML', () => {
    cy.get('#data-sayhi').should('contain', 'hello John')
  })
  it('setup() runs correctly', () => {
    cy.get('#data-setup').should('contain', 'Actioned:')
  })
  it('dependencies configured correctly', () => {
    cy.get('#data-depends').should('contain', 'dsTestSetup')
  })
})
