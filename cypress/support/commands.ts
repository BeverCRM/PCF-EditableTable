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
  }
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
  // cy.getAllCookies().then(cookies => {
  //   console.log('COOKIES in LOGIN');
  //   console.log(cookies);
  //   const modifiedCookies = cookies.map(cookie => ({
  //     ...cookie,
  //     sameSite: 'no_restriction',
  //     secure: true,
  //   }));

  //   modifiedCookies.forEach(cookie => {
  //     cy.setCookie(cookie.name, cookie.value, {
  //       ...cookie,
  //       sameSite: 'no_restriction',
  //       secure: true,
  //     });
  //   });
  // });
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
  // });
  // cy.getAllCookies().then(cookies => {
  //   console.log('COOKIES');
  //   console.log(cookies);

  //   const modifiedCookies = cookies.map(cookie => ({
  //     ...cookie,
  //     sameSite: 'no_restriction',
  //     secure: true,
  //   }));

  //   modifiedCookies.forEach(cookie => {
  //     cy.setCookie(cookie.name, cookie.value, {
  //       ...cookie,
  //       sameSite: 'no_restriction',
  //       secure: true,
  //     });
  //   });
  // });
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

Cypress.Commands.add('createRecord', field1Value => {
  cy.get('[data-icon-name="Add"]').should('be.visible').click();
  cy.wait(1000);
  cy.get('input.ms-TextField-field:not([role="combobox"])').eq(0).type(field1Value);
  cy.get('[data-icon-name="Save"]').should('be.visible').click();
  cy.wait(5000);
});

Cypress.Commands.add('deleteRecord', () => {
  cy.get('delete-button-selector').click(); // CheckBox;
  cy.get('[data-icon-name="Delete"]').should('be.visible').click();
});

Cypress.Commands.add('refreshGrid', () => {
  cy.get('[data-icon-name="Refresh"]').should('be.visible').click();
});
