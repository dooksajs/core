/// <reference types="cypress" />

describe('dsStarter plugin', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should get count token value', () => {
    cy.get('p').contains('1')
  })

  it('should increment count', () => {
    cy.window()
      .then(win => {
        // Increment internal count data
        return win.dsApp.$method('dsStarter/increment')
      })
      .then((count) => {
        expect(count).to.equal(2)
      })
  })
})
