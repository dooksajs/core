describe('default test run, using dev webpack of ds-plugins', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081/')
  })
  it('run for coverage results of example tests', () => {
    cy.get('script').should('contain', 'main')
  })
  it('plugin method sayHi loaded and runs', () => {
    cy.debug()
    cy.get('#data-sayhi').should('have.text', 'Hi John! My age is 10 years old.')
  })
  it('plugin method positiveNumber loaded and runs', () => {
    cy.debug()
    cy.get('#data-posnumber').should('have.text', '1')
  })
  it('plugin method positiveNumber loaded and error reported', () => {
    cy.debug()
    cy.get('#data-posnumber-error').should('have.text', 'Error: No negative numbers!')
  })
})
