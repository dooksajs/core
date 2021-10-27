describe('Dummy', () => {
  it('does nothing', () => {
    expect(true)
  })
})
describe('Loading test', () => {
  it('load test', () => {
    cy.visit('http://localhost:8080')
    cy.debug()
  })
})
