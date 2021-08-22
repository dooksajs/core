describe('ds-plugin-operators e2e simple tests, using dev webpack', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
  })
  it('is the right script name built', () => {
    cy.get('script').should('contain', 'main')
  })
  it('plugin operator ++x loads and increments', () => {
    cy.get('button').click() // trigger empty params
    cy.get('#operand-0').type('1')
    cy.get('#operator').type('++x')
    cy.get('button').click()
    cy.get('#data-eval').should('have.text', '1 ++x  -> 2')
  })
  it('plugin operator ++x loads and nothing input', () => {
    cy.get('button').click()
    cy.get('#operator').type('++x')
    cy.get('#data-eval').should('have.text', '   -> 1')
  })
})

describe('ds-plugin-operators compare() "&&" tests', () => {
  it('test compare(values), values = ["1==1","&&","2==2"]', () => {
    const argA = 1
    const argB = 2
    cy.get('#operand-0').clear()
    // eslint-disable-next-line
    cy.get('#operand-0').type(`${argA === argA}`)
    cy.get('#operand-1').clear()
    // eslint-disable-next-line
    cy.get('#operand-1').type(`${argB===argB}`)
    cy.get('#operator').clear()
    cy.get('#operator').type('&&')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', 'true && true -> true')
  })
  it('test compare(values), values = [,"&&",]', () => {
    cy.get('#operand-0').clear()
    cy.get('#operand-1').clear()
    cy.get('#operator').clear()
    cy.get('#operator').type('&&')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', ' &&  -> false')
  })
  it('test compare(values), values = [,"&&",1]', () => {
    cy.get('#operand-0').clear()
    cy.get('#operand-1').clear()
    cy.get('#operand-1').type(1)
    cy.get('#operator').clear()
    cy.get('#operator').type('&&')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', ' && 1 -> false')
  })
  it('test compare(values), values = ["guinea","&&", "pig"]', () => {
    cy.get('#operand-0').clear()
    cy.get('#operand-0').type('guinea')
    cy.get('#operand-1').clear()
    cy.get('#operand-1').type('pig')
    cy.get('#operator').clear()
    cy.get('#operator').type('&&')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', 'guinea && pig -> true')
  })
})
describe('ds-plugin-operators compare() "||" tests', () => {
  it('test compare(values), values = ["1==1","||","2==2"]', () => {
    const argA = 1
    const argB = 2
    cy.get('#operand-0').clear()
    // eslint-disable-next-line
    cy.get('#operand-0').type(`${argA === argA}`)
    cy.get('#operand-1').clear()
    // eslint-disable-next-line
    cy.get('#operand-1').type(`${argB===argB}`)
    cy.get('#operator').clear()
    cy.get('#operator').type('||')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', 'true || true -> true')
  })
  it('test compare(values), values = [,"||",]', () => {
    cy.get('#operand-0').clear()
    cy.get('#operand-1').clear()
    cy.get('#operator').clear()
    cy.get('#operator').type('||')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', ' ||  -> false')
  })
  it('test compare(values), values = [,"||",1]', () => {
    cy.get('#operand-0').clear()
    cy.get('#operand-1').clear()
    cy.get('#operand-1').type(1)
    cy.get('#operator').clear()
    cy.get('#operator').type('||')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', ' || 1 -> true')
  })
  it('test compare(values), values = ["guinea","||", "pig"]', () => {
    cy.get('#operand-0').clear()
    cy.get('#operand-0').type('guinea')
    cy.get('#operand-1').clear()
    cy.get('#operand-1').type('pig')
    cy.get('#operator').clear()
    cy.get('#operator').type('||')
    cy.get('button').click()
    cy.get('#data-compare').should('have.text', 'guinea || pig -> true')
  })
})
describe('test ds-plugin-operators array*', () => {
  /* grab and use JSON file containing all test case arguments
     This JSON is also used by webpack dev to display
     a list of tests with RUN buttons
     JSON schema and JSON data served by Webpack from data directory */
  const arrayTests = require('./data/arrayTests.json')
  it('checking the object is cool', () => {
    cy.writeFile('./data/arrayout.txt', arrayTests, { flag: 'a+', log: true })
  })
  for (let i = 0; i < arrayTests.length; i++) {
    const arrayTest = JSON.stringify(arrayTests[i])
    if (arrayTest.match(/\$/)) {
      continue
    }
    it(`arrayTest number: ${i} `, () => {
      Cypress.$('#data-arrayop').html('')
      cy.get('#operand-0').clear().type(`${arrayTest}`, { parseSpecialCharSequences: false })
      cy.get('#operator').clear().type(`${arrayTests[i].operator}`)
      cy.get('button').click()
      cy.get('#data-arrayop').should('contain', `${arrayTests[i].expectedResult}`)
    })
  }
})
describe('ds-plugin-operators e2e operands input', () => {
  it('test all the eval operators', () => {
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
            cy.get('#data-eval').should('not.contain', 'Sars-COV-2') // could be improved
            cy.log(op)
          })
        }
      })
  })
})
