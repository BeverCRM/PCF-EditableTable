describe('Editable Table Time Zone Test', () => {

  beforeEach(() => {
    cy.fixture('user').then(user => {
      cy.login(user.user2.userName, user.user2.password);
    });

    cy.fixture('record').then(record => {
      cy.visitD365Environment(record.appId, record.entityName, record.recordId);
    });
    cy.wait(3000);
    cy.get('[data-id="tablist-tab_2"]').should('be.visible').click();
    cy.wait(3000);

  });
  it(`Should check for dateTime correct convertions`, () => {
    cy.fixture('dateTimeData').then(testData => {
      testData.user1.forEach((data: DateTimeData) => {
        cy.assertFieldValues(data);
      });
    });
  });
});
