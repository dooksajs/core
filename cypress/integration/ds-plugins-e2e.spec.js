describe('ds-plugins e2e test run, using dev webpack', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8081/')
  })
  it('is the right script name built', () => {
    cy.get('script').should('contain', 'main')
  })
  it('plugin method sayHi loads and runs', () => {
    cy.get('#data-sayhi').should('have.text', 'Hi John! My age is 10 years old.')
  })
  it('plugin method positiveNumber loaded and runs', () => {
    cy.get('#posnumber').type('1')
    cy.get('#data-posnumber').should('have.text', '1')
  })
  it('plugin method positiveNumber loaded and error reported', () => {
    cy.get('#posnumber').type('-4')
    cy.get('#data-posnumber').should('have.text', 'Error: No negative numbers!')
  })
  it('plugin method promisePositiveNumber loaded and runs', () => {
    cy.debug()
    cy.get('#posnumber').type('5')
    cy.get('#data-promise-posnumber').should('have.text', '5')
  })
  it('plugin method promisePositiveNumber loaded and error reported', () => {
    cy.debug()
    // Clear text from any previous test updates
    // cy.get('#data-promise-posnumber-error').then(($el) => {
    //   $el.contents().filter((_, el) => el.nodeType === 3).remove()
    // })
    cy.get('#posnumber').type('5')
    cy.get('#data-promise-posnumber-error').should('have.text', 'Error: Promise no negative numbers!')
  })
  // Fix with DS-439
  // it('plugin action does not exist RED', () => {
  //    cy.debug()
  //   cy.get('#data-fakefunction').should('have.text', 'Error: 2')
  // })
  it('direct method sayHi expect fail', () => {
    cy.get('#data-directhello-error').should('have.text', 'Error: Method "dsTest/sayHi" does not exist')
  })
  it('direct method sayHi when available', () => {
    cy.get('#data-directhello').should('have.text', 'Safe run method: Hi John! My age is 10 years old.')
  })
  it('plugin promise callback onSuccess method', () => {
    cy.debug()
    cy.get('#data-promise-callbackmethod').should('have.text', '1')
  })
  it('plugin promise callback onError method', () => {
    cy.debug()
    cy.get('#data-promise-callbackmethod-error').should('have.text', 'Error: Promise no negative numbers!')
  })
})
