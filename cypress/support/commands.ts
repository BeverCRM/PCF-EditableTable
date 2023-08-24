// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): Chainable<void>;
    visitD365Environment(appId: string, entityName: string, recordId: string): Chainable<void>;
    assertFieldValues(data: DateTimeData): Chainable<void>;
    waitForPseudoElement(): Chainable<void>;
    signInHandler(popupElement: string, buttonElement: string): Chainable<void>;
  }
}

interface Assertion {
  selector: string;
  index: number;
  value: string;
}

interface DateTimeData {
  value: string;
  assertions: Assertion[];
}

Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    cy.origin(
      'https://login.microsoftonline.com/',
      { args: { username, password } },
      ({ username, password }) => {
        Cypress.on('uncaught:exception', () => false);
        cy.visit('https://login.microsoftonline.com');
        cy.get('[name="loginfmt"]').type(`${username}{enter}`);
        cy.get('[name="passwd"]').type(`${password}{enter}`);
        cy.get('[type="submit"]').click();
      });
  });
});

Cypress.Commands.add('visitD365Environment', (appId, entityName, recordId) => {
  Cypress.on('uncaught:exception', () => false);
  cy.visit(`main.aspx?` +
          `appid=${appId}` +
          `&pagetype=entityrecord` +
          `&etn=${entityName}` +
          `&id=${recordId}`);
});

Cypress.Commands.add('assertFieldValues', data => {
  cy.get(`div .ms-DetailsRow-fields input[value="${data.value}"]`)
    .closest('.ms-DetailsRow-fields')
    .then(row => {
      data.assertions.forEach(assertion => {
        cy.wrap(row)
          .find(assertion.selector)
          .eq(assertion.index)
          .should('have.value', assertion.value);
      });
    });
});

Cypress.Commands.add('waitForPseudoElement', { prevSubject: 'element' }, element => {
  function checkBeforePseudoElement() {
    const beforeContent = window.getComputedStyle(element[0], '::before').content;
    if (beforeContent === 'none') {
      cy.wait(100).then(checkBeforePseudoElement);
    }
    else {
      return;
    }
  }
  checkBeforePseudoElement();
});

Cypress.Commands.add('signInHandler', (popupElement, buttonElement) => {
  cy.get('body').then($body => {
    if ($body.find(popupElement).length) {
      cy.get(buttonElement).click({ force: true });
    }
    else {
      cy.wait(2000);
      cy.signInHandler(popupElement, buttonElement);
    }
  });
});
