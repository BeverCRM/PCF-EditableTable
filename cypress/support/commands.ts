/* eslint-disable max-nested-callbacks */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): Chainable<void>;
    visitD365Environment(appId: string, entityName: string, recordId: string): Chainable<void>;
    removeSignInDialogWindow(): Chainable<void>;
    createRecord(field1Value: string): Chainable<void>;
    deleteRecord(): Chainable<void>;
    refreshGrid(): Chainable<void>;
    assertFieldValues(data: DateTimeData): Chainable<void>;
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
  }).then(() => {
    cy.fixture('record').then(record => {
      cy.visitD365Environment(record.appId, record.entityName, record.recordId);
    });
  },
  );
});

Cypress.Commands.add('visitD365Environment', (appId, entityName, recordId) => {
  // cy.on('uncaught:exception', (err, runnable) => false);
  // cy.origin(`https://bevertest.crm4.dynamics.com`,
  // { args: { appId, entityName, recordId } },
  // ({ appId, entityName, recordId }) => {
  Cypress.on('uncaught:exception', () => false);
  cy.visit(`main.aspx?` +
          `appid=${appId}` +
          `&pagetype=entityrecord` +
          `&etn=${entityName}` +
          `&id=${recordId}`);

  cy.get('body[data-loaded="1"]').should('exist');

  cy.get('button[aria-label="Sign In"]').as('btn').click();
  cy.get('@btn').click();
  // const interval = setInterval(() => {
  //   cy.get('button[aria-label="Sign In"]').should('be.visible').click().then(() => {
  //     count += 1;
  //     if (count === 2) {
  //       console.log('THE COUNT IS 2!');
  //       clearInterval(interval);
  //       cy.getCookies().then(cookies => {
  //         cookies.forEach(cookie => {
  //           cy.setCookie(cookie.name, cookie.value);
  //         });
  //       });
  //     }
  //   });
  // }, 1000);
});

Cypress.Commands.add('removeSignInDialogWindow', () => {
  const interval = setInterval(() => {
    const DialogPopup = cy.get('#DialogContainer__1_popupContainer');
    DialogPopup.then(element => {
      if (element[0]) {
        clearInterval(interval);
        element[0].style.display = 'none';
      }
    });
  }, 1000);
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
