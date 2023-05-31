/// <reference types="cypress" />

describe('dsStarter plugin', () => {
  it('should get count', () => {
    cy.visit('/')
    cy.window()
      .then(win => {
        // Increment internal count data
        return win.dsApp.$method('dsStarter/getCount')
      })
      .then((count) => {
        expect(count).to.equal(0)
      })
  })

  it('should increment count', () => {
    cy.visit('/')
    cy.window()
      .then(win => {
        // Increment internal count data
        return win.dsApp.$method('dsStarter/increment')
      })
      .then((count) => {
        expect(count).to.equal(1)
      })
  })
})
