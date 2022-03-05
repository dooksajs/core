describe('Dummy', () => {
  it('does nothing', () => {
    expect(true)
  })
})
describe('Loading test', () => {
  it('load test', () => {
    cy.debug()
    cy.visit('/')
  })
})
