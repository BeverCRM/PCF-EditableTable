describe('Editable Table', () => {
  beforeEach(() => {
    cy.fixture('user').then(user => {
      cy.login(user.user1.userName, user.user1.password);
    });
    cy.wait(3000);
    cy.get('body[data-loaded="1"]').should('exist');
    cy.get('[data-id="tablist-tab_2"]').should('be.visible').click();
    cy.get('body[data-loaded="1"]').should('exist');
    cy.wait(3000);
    // cy.removeSignInDialogWindow();
  });

  it(`Should click on New Button -> click on Refresh button ->
  refresh the grid -> check for columns sizes`, () => {
    cy.get('.ms-List-cell').then(listCells => {
      const listCellCount = listCells.length;
      cy.get('div[role="columnheader"][aria-colindex="2"][data-automationid="ColumnsHeaderColumn"]')
        .invoke('outerWidth')
        .then(width => {
          const initialWidth = width;
          cy.log(`Width: ${width}px`);
          cy.get('[data-icon-name="Add"]').should('be.visible').click();
          cy.get('[data-icon-name="Refresh"]').should('be.visible').click();
          cy.wait(2000);

          cy.get('.ms-List-cell').should('be.visible')
            .its('length').should('be.eq', listCellCount + 1);
          cy.get('div[role="columnheader"][aria-colindex="2"][data-automationid="ColumnsHeaderColumn"]')
            .invoke('outerWidth')
            // eslint-disable-next-line max-nested-callbacks
            .then(width => {
              expect(width).to.equal(initialWidth);
            });
        });
    });
  });

  it('Should select a row -> show Delete button -> unselect -> hide Delete button', () => {
    cy.get('.ms-Check').eq(1).click();
    cy.get('.ms-Check').eq(1).should('have.class', 'is-checked');
    cy.get('[data-icon-name="Delete"]').should('be.visible');

    cy.get('.ms-Check').eq(1).click();
    cy.get('.ms-Check').eq(1).should('not.have.class', 'is-checked');
    cy.get('[data-icon-name="Delete"]').should('not.be.visible');
  });

  it('Should select a row -> Delete -> OK and delete selected record', () => {
    cy.get('.ms-List-cell').then(listCells => {
      const listCellCount = listCells.length;
      cy.get('.ms-Check').eq(1).click();
      cy.get('.ms-Check').eq(1).should('have.class', 'is-checked');
      cy.get('[data-icon-name="Delete"]').should('be.visible').click();
      cy.get('[aria-label="OK"]').should('be.visible').click();
      cy.wait(3000);
      cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', listCellCount - 1);
    });
  });

  it('Should select a row -> Delete -> Cancel and cancel the delete event', () => {
    cy.wait(2000);
    cy.get('.ms-List-cell').then(listCells => {
      const listCellCount = listCells.length;
      cy.get('.ms-Check').eq(1).click();
      cy.get('.ms-Check').eq(1).should('have.class', 'is-checked');
      cy.get('[data-icon-name="Delete"]').should('be.visible').click();
      cy.get('[aria-label="Cancel"]').should('be.visible').click();
      cy.wait(3000);
      cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', listCellCount);
    });
  });

  it('Should double click on a record -> navigate to the selected record', () => {
    cy.get('.ms-DetailsRow-fields').eq(0).should('be.visible').dblclick({ force: true });
  });

  it('Should click on empty currency lookup field -> display options -> select -> unselect', () => {
    cy.get('div[data-automation-key="transactioncurrencyid"] input').eq(0).click();

    cy.get('button[aria-label="USD"]').should('be.visible').click();
    cy.get('.ms-BasePicker').eq(0).should('be.visible').should('contain', 'USD');
    cy.wait(1000);
    cy.get('[data-icon-name="Cancel"]').eq(0).should('be.visible').click();
    cy.get('.ms-BasePicker').should('be.visible').should('not.contain', 'USD');
  });

  it(`Should click on New button -> remove parent lookup field value ->
    click on Save -> save the record but not show on the grid`, () => { // !checklength
    cy.get('[data-icon-name="Add"]').should('be.visible').click();
    // cy.wait(1000);

    // cy.get('.ms-List-cell').then(listCells => {
    //   const listCellCount = listCells.length;
    cy.get('input.ms-TextField-field:not([role="combobox"])').should('be.visible').eq(0)
      .type('CypressTest1');
    cy.get('div[data-automation-key="bvr_parentfk"] i[data-icon-name="Cancel"]').eq(0).click();
    cy.get('[data-icon-name="Save"]').should('be.visible').click();
    //   cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', listCellCount - 1);
    // });
  });

  it(`Should click Next Page button -> switch to the next page -> Click Prev Page button ->
    switch to the previous page -> click First Page button -> switch to the first page`, () => {

    cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', 5);
    cy.get('[data-icon-name="Forward"]').click({ force: true });
    cy.wait(4000);
    cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', 5);
    cy.get('[data-icon-name="Forward"]').click({ force: true });
    cy.wait(4000);
    cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', 1);
    cy.get('[data-icon-name="Back"]').should('not.be.disabled').click({ force: true });
    cy.wait(4000);
    cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', 5);
    cy.get('[data-icon-name="Previous"]').should('not.be.disabled').click({ force: true });
    cy.wait(4000);
    cy.get('.ms-List-cell').should('be.visible').its('length').should('be.eq', 5);
  });

  it(`Should click on lookup field and navigate to the record`, () => {
    cy.get('div[data-automation-key="bvr_parentfk"] button.ms-Button').eq(0).click();
  });

  it('Should click on ComboBox type fields -> select values -> unselect values', () => {
    cy.get('[data-icon-name="Add"]').click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(0).click();
    cy.get('.ms-ComboBox-optionText').eq(0).should('be.visible').click();
    cy.get('[data-automation-key="bvr_booltest"] input').eq(0).should('have.value', 'Yeeeeees');

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(1).click();
    cy.get('.ms-ComboBox-optionText').eq(1).should('be.visible').click();
    cy.get('[data-automation-key="bvr_duration"] input').eq(0).should('have.value', '1 minute');

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).click();
    cy.get('.ms-ComboBox-optionText').eq(0).should('be.visible').click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).closest('div')
      .find('input').should('have.value', '12:00 AM');

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(4).click();
    cy.get('.ms-ComboBox-optionText').eq(0).should('be.visible').click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(4).closest('div')
      .find('input').should('have.value', '12:00 AM');

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).click();
    cy.get('.ms-ComboBox-optionText').eq(0).should('be.visible').click();
    cy.get('.ms-ComboBox-optionText').eq(1).should('be.visible').click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).closest('div')
      .find('input').should('have.attr', 'placeholder', 'Item1, Item2');

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(7).click();
    cy.get('.ms-ComboBox-optionText').eq(0).should('be.visible').click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(7).closest('div')
      .find('input').should('have.value', 'Item1');

    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).click();
    cy.get('td[role="presentation"] button').contains('14').closest('button').click();
    cy.wait(2000);
    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).closest('div')
      .find('input').should('have.value', '07/14/2023');

  });

  it(`Should set the date -> check if time is 12:00 AM -> change the time -> 
  change the date -> check if time remains the same`, () => {
    cy.get('[data-icon-name="Add"]').click();

    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).click();
    cy.get('td[role="presentation"] button').contains('14').closest('button').click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).closest('div')
      .find('input').should('have.value', '12:00 AM');

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).click();
    cy.get('.ms-ComboBox-optionText').eq(1).should('be.visible').click();

    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).click();
    cy.get('td[role="presentation"] button').contains('11').closest('button').click();

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).closest('div')
      .find('input').should('have.value', '12:30 AM');
  });

  it(`Should set string value in int, float, decimal, currency fields ->
    change the value to zero`, () => {
    cy.get('div[data-automation-key="bvr_turtest"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_inttest"] input').eq(0).type('str');

    cy.get('div[data-automation-key="bvr_mlottest"] input').eq(0).click();

    cy.get('div[data-automation-key="bvr_turtest"] input').eq(0).should('have.value', '0.00');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).should('have.value', '0.00');
    cy.get('div[data-automation-key="bvr_inttest"] input').eq(0).should('have.value', '0.00');

  });

  it('Should set string value in duration, lookup fields -> change the value to blank', () => {
    cy.get('div[data-automation-key="transactioncurrencyid"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).type('str');

    cy.get('div[data-automation-key="bvr_mlottest"] input').eq(0).click();

    cy.get('div[data-automation-key="transactioncurrencyid"] input').eq(0).should('have.value', '');
    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).should('have.value', '');
  });

  it(`Should set number in duration column -> 
  save -> must show it in a correct format`, () => {
    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).type('1500');
    cy.get('[data-icon-name="Save"]').click();
    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).should('have.value', '1.04 days');
  });

  it(`Should check if locked fields are disabled`, () => {
    cy.get('div[data-automation-key="bvr_turtest_base"] input').eq(0).should('be.disabled');
    cy.get('div[data-automation-key="statecode"] input').eq(0).should('be.disabled');
    cy.get('div[data-automation-key="statuscode"] input').eq(0).should('be.disabled');

  });

  it(`Should set string value in date and time field -> show Invalid Entry error`, () => {
    cy.get('div[data-automation-key="bvr_dtitest"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_mlottest"] input').eq(0).click();
    cy.get('div[data-automation-key="bvr_dtitest"]').eq(0)
      .contains('Invalid entry').should('exist');
  });

  it('Should set string value in duration, lookup fields -> change the value to blank', () => {
    cy.get('[data-icon-name="Add"]').click();
    cy.get('div[data-automation-key="bvr_dbtest"] input').eq(0).type('1.1');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).type('1.1');
    cy.get('[data-icon-name="Save"]').click();
    cy.wait(4000);

    cy.get('div[data-automation-key="bvr_dbtest"] input').eq(0).should('have.value', '1.1000');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).should('have.value', '1.100');
  });

  it.only('Should show error dialog if required fields are not filled', () => {
    cy.wait(100000);
    cy.get('body[data-loaded="1"]').should('exist');
    cy.get('body').should($body => {
      expect($body.attr('data-loaded')).to.equal('1');
    });
    cy.get('[data-icon-name="Add"]').click();
    cy.wait(100000);
    cy.get('[data-icon-name="Save"]').click();
    cy.get('[data-id="errorDialog_subtitle"]').contains('All required fields must be filled in.');
  });

  it(`Should click on New button -> 
    check if parent lookup, owner, status and status reason are autopopulated`, () => {
    cy.get('[data-icon-name="Add"]').click();

    cy.get('div[data-automation-key="bvr_parentfk"] input')
      .contains('E2E Test Editable Table').should('exist');
    cy.get('div[data-automation-key="ownerid"] input').eq(0)
      .should('have.value', 'developer developer');
    cy.get('div[data-automation-key="statecode"] input').eq(0).should('have.value', 'Active');
    cy.get('div[data-automation-key="statuscode"] input').eq(0).should('have.value', 'Active');

  });

  it(`Should change currency -> 
  check for currency field symbol`, () => {
    cy.get('[data-icon-name="Cancel"]').eq(0).should('be.visible').click();
    cy.get('div[data-automation-key="transactioncurrencyid"] input').eq(0).click();
    cy.get('button[aria-label="рубль"]').should('be.visible').click();
    cy.get('.ms-BasePicker').eq(0).should('be.visible').should('contain', 'рубль');
    cy.get('[data-icon-name="Save"]').click();
    cy.wait(2000);

    cy.get('div[data-automation-key="bvr_turtest"] input').eq(0)
      .invoke('val').should('contain', '₽');
  });

  it(`Should click on New button -> Save record -> 
  Navigate to it -> check for parent lookup field`, () => {
    cy.get('[data-icon-name="Add"]').should('be.visible').click();
    cy.get('input.ms-TextField-field:not([role="combobox"])').eq(0).type('CypressTest2');
    cy.get('[data-icon-name="Save"]').click();
    cy.wait(7000);

    cy.get('.ms-DetailsRow-fields').eq(0).should('be.visible').dblclick({ force: true });
    cy.wait(2000);
    cy.get('div[aria-label="E2E Test Editable Table"][data-id="bvr_parentfk.fieldControl-LookupResultsDropdown_bvr_parentfk_selected_tag"]').should('exist');
  });

  it(`Should resize a column and check if its width is correct`, () => {

    cy.get('.ms-DetailsHeader-cellSizer').eq(0)
      .then(el => {
        const rect = el[0].getBoundingClientRect();
        const pageYDragAmount = 200;

        cy.window().then(window => {
          const pageY = rect.top + window.scrollY;

          cy.wrap(el)
            .trigger('mouseover', {
              force: true,
            })
            .trigger('mousedown', {
              which: 1,
              pageX: rect.left,
              pageY,
              force: true,
            })
            .trigger('mousemove', {
              pageX: rect.left,
              pageY: pageY + pageYDragAmount,
              force: true,
              position: 'center',
            })
            .trigger('mousemove')
            .trigger('mouseup', {
              which: 1,
              force: true,
            });
        });
      });
    // cy.get('[data-item-key="bvr_booltest"]').then($div => {
    //   const initialWidth = Cypress.$($div).width();
    //   const resizeValue = 200;
    //   cy.get('.ms-DetailsHeader-cellSizer').eq(0)
    //     .trigger('mousedown')
    //     .wait(1500)
    //     .trigger('mousemove', {
    //       clientX: 700,

    //     })
    //     .trigger('mouseup', { force: true });
    //   cy.get('[data-item-key="bvr_booltest"]').should($divAfterResize => {
    //     const finalWidth = Cypress.$($divAfterResize).width();

    //     expect(finalWidth).to.equal(initialWidth + resizeValue);
    //   });
    // });
  });

  it('Should click on New button (records count = 6) -> check for Scrollable Pane visibility', () => {
    cy.get('[data-icon-name="Add"]').should('be.visible').click();
    cy.get('.ms-ScrollablePane--contentContainer').then(scrollablePane => {
      const { scrollHeight } = scrollablePane[0];
      const { clientHeight } = scrollablePane[0];

      expect(scrollHeight).to.be.greaterThan(clientHeight);
    });

    cy.get('.ms-DetailsList.is-fixed.is-horizontalConstrained').then(scrollablePane => {
      const { scrollWidth } = scrollablePane[0];
      const { clientWidth } = scrollablePane[0];

      expect(scrollWidth).to.be.greaterThan(clientWidth);
    });
  });

  const getIframeDocument = () => cy
    .get('iframe[id="InlineDialog_Iframe"]')
    .its('0.contentDocument').should('exist');

  const getIframeBody = () =>
    getIframeDocument()
      .its('body').should('not.be.undefined')
      .then(cy.wrap);

  it('Should change the DateTime Format', () => {
    cy.get('button[aria-label="Settings"]').click();
    cy.get('[title="Personalization Settings"]').click();
    cy.wait(2000);
    getIframeBody().find('#timezone').select('(GMT+01:00) Brussels, Copenhagen, Madrid, Paris');
    getIframeBody().find('#butBegin').click();
  });

  it(`Should check for dateTime correct convertions`, () => {
    cy.fixture('dateTimeData').then(testData => {
      testData.user2.forEach((data: DateTimeData) => {
        cy.assertFieldValues(data);
      });
    });
  });
});