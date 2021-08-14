describe('ds-plugin-operators e2e test run, using dev webpack', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
  })
  it('is the right script name built', () => {
    cy.get('script').should('contain', 'main')
  })
  it('plugin operator ++x loads and increments', () => {
    cy.get('button').click()
    cy.get('#operand-0').type('1')
    cy.get('#operator').type('++x')
    cy.get('button').click()
    cy.get('#data-eval').should('have.text', '1 ++x -> 2')
  })
  it('plugin operator ++x loads and nothing input', () => {
    cy.get('button').click()
    cy.get('#operator').type('++x')
    cy.get('#data-eval').should('have.text', '  -> 1')
  })
})
describe('ds-plugin-operators e2e operands input', () => {
  it('get all the operators', () => {
    cy.exec('getOperators.sh')
      .then((result) => {
        if (result.code === 0) {
          result.stdout.split(',').forEach(op => {
            const bareOp = op.replace(/'/g, '')
            cy.get('#operand-0').type('1')
            cy.get('#operand-1').type('2')
            cy.get('#operator').clear()
            cy.get('#operator').type(bareOp)
            cy.get('button').click()
            cy.get('#data-eval').should('not.contain', 'Sars-COV-2')
            cy.log(op)
          })
        }
      })
  })
})
