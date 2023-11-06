/* global describe, it, cy, expect */
/* eslint-env mocha */

describe('dsExample plugin', () => {
  it('should get count from global state', () => {
    cy.visit('/')
    cy.window()
      .then(win => {
        // Increment internal count data
        return win.dsApp.$getDataValue('dsExample/count').item
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
        return win.dsApp.$method('dsExample/increment')
      })
      .then((count) => {
        expect(count).to.equal(1)
      })
  })
})
