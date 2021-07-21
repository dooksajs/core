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
  it('plugin method promisePositiveNumber loaded and runs', () => {
    cy.debug()
    cy.get('#data-promise-posnumber').should('have.text', '1')
  })
  it('plugin method promisePositiveNumber loaded and error reported', () => {
    cy.debug()
    cy.get('#data-promise-posnumber-error').should('have.text', 'Error: Promise no negative numbers!')
  })
  // Fix with DS-439
  // it('plugin action does not exist', () => {
  //   cy.debug()
  //   cy.get('#data-fakefunction').should('have.text', 'Error: 2')
  // })
  it('direct method sayHi expect fail', () => {
    cy.debug()
    cy.get('#data-directhello-error').should('have.text', 'Error: Method "dsTest/sayHi" does not exist')
  })
  it('direct method sayHi when available', () => {
    cy.debug()
    cy.get('#data-directhello').should('have.text', 'Safe run method: Hi John! My age is 10 years old.')
  })
})
