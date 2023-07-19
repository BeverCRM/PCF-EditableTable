describe('Editable Table', () => {
  beforeEach(() => {
    cy.fixture('user').then(user => {
      cy.login(user.user1.userName, user.user1.password);
    });

    cy.fixture('record').then(record => {
      cy.visitD365Environment(record.appId, record.entityName, record.recordId);
    });

    cy.get('body[data-loaded="1"]').should('exist');
    cy.get('[data-id="tablist-tab_2"]').should('be.visible').click();
  });

  // cy.get('body[data-loaded="1"]').should('exist');

  // cy.get('button[aria-label="Sign In"]').as('btn').click();
  // cy.get('@btn').click();

  it(`Should click on New Button -> click on Refresh button ->
  refresh the grid -> check for columns sizes`, () => {
    cy.get('div[data-item-key="bvr_name"]')
      .invoke('outerWidth')
      .then(width => {
        const initialWidth = width;

        cy.get('[data-icon-name="Add"]').should('exist').click();
        cy.get('[data-icon-name="Refresh"]').should('exist').click();
        cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

        cy.get('div[data-item-key="bvr_name"]')
          .invoke('outerWidth')
          .then(width => {
            expect(width).to.equal(initialWidth);
          });
      });
  });

  it(`Should click Next Page button -> switch to the next page -> Click Prev Page button ->
  switch to the previous page -> click First Page button -> switch to the first page`, () => {

    cy.get('.ms-List-cell').should('exist').its('length').should('be.eq', 5);

    cy.get('[data-icon-name="Forward"]').click({ force: true });
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');
    cy.get('.ms-List-cell').should('exist').its('length').should('be.eq', 5);

    cy.get('[data-icon-name="Forward"]').click({ force: true });
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');
    cy.get('.ms-List-cell').should('exist').its('length').should('be.eq', 1);

    cy.get('[data-icon-name="Back"]').should('not.be.disabled').click({ force: true });
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');
    cy.get('.ms-List-cell').should('exist').its('length').should('be.eq', 5);

    cy.get('[data-icon-name="Previous"]').should('not.be.disabled').click({ force: true });
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');
    cy.get('.ms-List-cell').should('exist').its('length').should('be.eq', 5);
  });

  it('Should select a row -> show Delete button -> unselect -> hide Delete button', () => {
    cy.get('.ms-Check').eq(1).click();
    cy.get('.ms-Check').eq(1).should('have.class', 'is-checked');
    cy.get('[data-icon-name="Delete"]').should('not.have.css', 'display', 'none');

    cy.get('.ms-Check').eq(1).click();
    cy.get('.ms-Check').eq(1).should('not.have.class', 'is-checked');
    cy.get('[data-icon-name="Delete"]').should('not.be.visible');
  });

  it('Should select a row -> Delete -> OK and delete selected record', () => {
    cy.get('[data-id="tablist-tab_3"]').should('exist').click();
    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('.ms-List-cell').then(listCells => {
      const listCellCount = listCells.length;

      cy.get('div[data-automation-key="bvr_name"] input').eq(0).type('CypressDeleteTest');
      cy.get('[data-icon-name="Save"]').should('exist').click();
      cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

      cy.get('.ms-List-cell')
        .filter(':has(input[value="CypressDeleteTest"])')
        .find('.ms-Check').as('checkbox').click();

      cy.get('@checkbox').should('have.class', 'is-checked');

      cy.get('[data-icon-name="Delete"]').should('exist').click();
      cy.get('[aria-label="OK"]').should('exist').click();
      cy.wait(3000);
      cy.get('.ms-List-cell').its('length').should('be.eq', listCellCount - 1);
    });
  });

  it('Should select a row -> Delete -> Cancel and cancel the delete event', () => {
    cy.get('.ms-List-cell').then(listCells => {
      const listCellCount = listCells.length;
      cy.get('.ms-Check').eq(1).click();
      cy.get('.ms-Check').eq(1).should('have.class', 'is-checked');
      cy.get('[data-icon-name="Delete"]').should('exist').click();
      cy.get('[aria-label="Cancel"]').should('exist').click();

      cy.get('.ms-List-cell').should('exist').its('length').should('be.eq', listCellCount);
    });
  });

  it('Should double click on a record -> navigate to the selected record', () => {
    cy.get('div[data-automation-key="bvr_name"] input').invoke('val').then(inputValue => {
      cy.get('.ms-DetailsRow-fields').eq(0).should('exist').dblclick({ force: true });
      cy.get('input[data-id="bvr_name.fieldControl-text-box-text"]')
        .should('have.value', inputValue);
    });
  });

  it('Should click on empty currency lookup field -> display options -> select -> unselect', () => {
    cy.get('button[aria-label="Sign In"]').as('btn').click();
    cy.get('@btn').click();

    cy.get('div[data-automation-key="transactioncurrencyid"] input').eq(0).click();
    cy.get('button[aria-label="USD"]').should('exist').click();
    cy.get('.ms-BasePicker').eq(0).should('exist').should('contain', 'USD');
    cy.wait(1000);
    cy.get('[data-icon-name="Cancel"]').eq(0).should('exist').click();
    cy.get('.ms-BasePicker').should('exist').should('not.contain', 'USD');
  });

  it(`Should click on New button -> remove parent lookup field value ->
    click on Save -> save the record but not show on the grid`, () => {
    cy.get('button[aria-label="Sign In"]').as('btn').click();
    cy.get('@btn').click();

    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('.ms-List-cell').then(listCells => {
      const listCellCount = listCells.length;

      cy.get('div[data-automation-key="bvr_name"] input').eq(0)
        .type('ParentLookupRemoveTest');
      cy.get('div[data-automation-key="bvr_parentfk"] i[data-icon-name="Cancel"]').eq(0).click();

      cy.get('[data-icon-name="Save"]').should('exist').click();
      cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

      cy.get('.ms-List-cell').should('exist').its('length').should('be.eq', listCellCount - 1);
    });
  });

  it(`Should click on lookup field and navigate to the record`, () => {
    cy.get('div[data-automation-key="bvr_parentfk"] span.ms-Button-label').eq(0)
      .invoke('text').then(text => {
        cy.get('div[data-automation-key="bvr_parentfk"] button').eq(0).click();
        cy.get('input[data-id="bvr_name.fieldControl-text-box-text"]').should('have.value', text);
      });
  });

  it(`Should click on Bool, Duration, DateTime type fields -> 
    select values -> unselect values`, () => {
    cy.get('[data-icon-name="Add"]').click();

    // select Bool
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(0).click();
    cy.get('.ms-ComboBox-optionText').eq(0).click();
    cy.get('[data-automation-key="bvr_booltest"] input').eq(0).should('have.value', 'Yeeeeees');

    // select Duration
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(1).click();
    cy.get('.ms-ComboBox-optionText').eq(1).click();
    cy.get('[data-automation-key="bvr_duration"] input').eq(0).should('have.value', '1 minute');

    // select Time
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).click();
    cy.get('.ms-ComboBox-optionText').eq(0).click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).closest('div')
      .find('input').should('have.value', '12:00 AM');

    // choose Date
    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).click();
    cy.get('td[role="presentation"] button').contains('14').closest('button').click();
    cy.wait(2000);
    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).closest('div')
      .find('input').should('have.value', '07/14/2023');

    // remove Date
    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).closest('div')
      .find('input').as('dateTimeInput').type('{selectall}{backspace}');
    cy.get('@dateTimeInput').should('have.value', '');

  });

  it(`Should click on OS, MOS, Date type fields -> select values -> unselect values`, () => { // -
    cy.get('[data-icon-name="Add"]').should('exist').click();

    // select MOS
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).click();
    cy.get('.ms-ComboBox-optionText').eq(0).click();
    cy.get('.ms-ComboBox-optionText').eq(1).click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).closest('div')
      .find('input').as('MOSInput').should('have.attr', 'placeholder', 'Item1, Item2');

    // unselect MOS
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).click();
    cy.get('.ms-ComboBox-optionText').eq(0).click();
    cy.get('.ms-ComboBox-optionText').eq(1).click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(6).click();
    cy.get('@MOSInput').should('not.have.attr', 'placeholder');

    // select OS
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(7).click();
    cy.get('.ms-ComboBox-optionText').eq(0).click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(7).closest('div')
      .find('input').should('have.value', 'Item1');
  });

  it(`Should set the date -> check if time is 12:00 AM -> change the time -> 
  change the date -> check if time remains the same`, () => {
    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).click();
    cy.get('td[role="presentation"] button').contains('14').closest('button').click();
    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).closest('div')
      .find('input').should('have.value', '12:00 AM');

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).click();
    cy.get('.ms-ComboBox-optionText').eq(1).should('exist').click();

    cy.get('.ms-List-cell [data-icon-name="Calendar"]').eq(0).click();
    cy.get('td[role="presentation"] button').contains('11').closest('button').click();

    cy.get('.ms-List-cell [data-icon-name="ChevronDown"]').eq(2).closest('div')
      .find('input').should('have.value', '12:30 AM');
  });

  it(`Should set string value in int, float, decimal, currency fields ->
    change the value to zero`, () => {
    cy.get('[data-id="tablist-tab_3"]').should('exist').click();
    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('div[data-automation-key="bvr_turtest"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_inttest"] input').eq(0).type('str');

    cy.get('div[data-automation-key="bvr_mlottest"] input').eq(0).click();

    cy.get('div[data-automation-key="bvr_turtest"] input').eq(0).should('have.value', '0.00');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).should('have.value', '0.00');
    cy.get('div[data-automation-key="bvr_inttest"] input').eq(0).should('have.value', '0.00');

  });

  it('Should set string value in duration, lookup fields -> change the value to blank', () => {
    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('div[data-automation-key="transactioncurrencyid"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).type('str');

    cy.get('div[data-automation-key="bvr_mlottest"] input').eq(0).click();

    cy.get('div[data-automation-key="transactioncurrencyid"] input').eq(0).should('have.value', '');
    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).should('have.value', '');
  });

  it(`Should set number in duration column -> 
  save -> must show it in a correct format`, () => {
    cy.get('[data-id="tablist-tab_3"]').should('exist').click();

    // create test record
    cy.get('[data-icon-name="Add"]').should('exist').click();
    cy.get('div[data-automation-key="bvr_name"] input').eq(0).type('CypressDurationTest');
    cy.get('[data-icon-name="Save"]').should('exist').click();
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).type('1500');
    cy.get('[data-icon-name="Save"]').should('exist').click();
    cy.get('div[data-automation-key="bvr_duration"] input').eq(0).should('have.value', '1.04 days');

    // delete test record
    cy.get('.ms-List-cell')
      .filter(':has(input[value="CypressDurationTest"])')
      .find('.ms-Check').as('checkbox').click();

    cy.get('@checkbox').should('have.class', 'is-checked');

    cy.get('[data-icon-name="Delete"]').click();
    cy.get('[aria-label="OK"]').click();
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');
  });

  it(`Should check if locked fields are disabled`, () => {
    cy.get('div[data-automation-key="bvr_turtest_base"] input').eq(0).should('be.disabled');
    cy.get('div[data-automation-key="statecode"] input').eq(0)
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('div[data-automation-key="statuscode"] input').eq(0)
      .should('have.attr', 'aria-disabled', 'true');
  });

  it(`Should set string value in date and time field -> show Invalid Entry error`, () => {
    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('div[data-automation-key="bvr_dtitest"] input').eq(0).type('str');
    cy.get('div[data-automation-key="bvr_mlottest"] input').eq(0).click();
    cy.get('div[data-automation-key="bvr_dtitest"]').eq(0)
      .contains('Invalid entry').should('be.visible');
  });

  it(`Should set value in decimal, double fields -> 
    change the value precisions accordingly`, () => {
    cy.get('button[aria-label="Sign In"]').as('btn').click();
    cy.get('@btn').click();

    cy.get('[data-id="tablist-tab_3"]').should('exist').click(); // (Error Loading Control Issue when in Test Tab)
    cy.get('[data-icon-name="Add"]').should('exist').click();
    cy.get('div[data-automation-key="bvr_dbtest"] input').eq(0).type('1.1');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).type('1.1');
    cy.get('[data-icon-name="Save"]').should('exist').click();
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

    cy.get('div[data-automation-key="bvr_dbtest"] input').eq(0).should('have.value', '1.1000');
    cy.get('div[data-automation-key="bvr_dectest"] input').eq(0).should('have.value', '1.100');

    cy.get('.ms-Check').eq(1).click();
    cy.get('.ms-Check').eq(1).should('have.class', 'is-checked');
    cy.get('[data-icon-name="Delete"]').click();
    cy.get('[aria-label="OK"]').click();
  });

  it('Should show error dialog if required fields are not filled', () => {
    cy.get('[data-id="tablist-tab_3"]').should('exist').click(); // (Error Loading Control Issue when in Test Tab)
    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('div[data-automation-key="bvr_name"] input').eq(0)
      .closest('div').waitForBeforePseudoElement();

    cy.get('[data-icon-name="Save"]').should('exist').click();
    cy.get('[data-id="errorDialog_subtitle"]')
      .contains('All required fields must be filled in.');
  });

  it(`Should click on New button -> 
    check if parent lookup, owner, status and status reason are autopopulated`, () => {
    cy.get('button[aria-label="Sign In"]').as('btn').click();
    cy.get('@btn').click();

    cy.get('[data-icon-name="Add"]').should('exist').click();
    cy.wait(1000);

    cy.get('div[data-automation-key="bvr_parentfk"] span').eq(1)
      .contains('E2E Test Editable Table').should('exist');
    cy.get('div[data-automation-key="ownerid"] input').eq(0)
      .should('have.value', 'developer developer');
    cy.get('div[data-automation-key="statecode"] input').eq(0).should('have.value', 'Active');
    cy.get('div[data-automation-key="statuscode"] input').eq(0).should('have.value', 'Active');

  });

  it(`Should change currency -> 
  check for currency field symbol`, () => {
    cy.get('button[aria-label="Sign In"]').as('btn').click();
    cy.get('@btn').click();

    // create currency test record
    cy.get('[data-icon-name="Add"]').should('exist').click();

    cy.get('div[data-automation-key="bvr_name"] input').eq(0).type('CurrencyTest');
    cy.get('div[data-automation-key="transactioncurrencyid"] input')
      .eq(0).as('currencyInput').click();
    cy.get('div[data-automation-key="bvr_turtest"] input').eq(0).type('10');

    cy.get('[data-icon-name="Save"]').should('exist').click();
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

    // change the currency and save
    cy.get('[data-icon-name="Cancel"]').eq(0).should('exist').click();
    cy.get('@currencyInput').click();
    cy.get('button[aria-label="рубль"]').should('exist').click();
    cy.get('.ms-BasePicker').eq(0).should('exist').should('contain', 'рубль');

    cy.get('[data-icon-name="Save"]').should('exist').click();
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

    cy.get('div[data-automation-key="bvr_turtest"] input').eq(0)
      .invoke('val').should('contain', '₽');

    // delete created test record
    cy.get('.ms-Check').eq(1).click();
    cy.get('.ms-Check').eq(1).should('have.class', 'is-checked');
    cy.get('[data-icon-name="Delete"]').click();
    cy.get('[aria-label="OK"]').click();
  });

  it(`Should click on New button (without parent lookup in the view) -> Save record -> 
  Navigate to it -> check for parent lookup field`, () => { // +
    cy.get('button[aria-label="Sign In"]').as('btn').click();
    cy.get('@btn').click();

    cy.get('[data-id="tablist-tab_3"]').should('exist').click();

    cy.get('[data-icon-name="Add"]').should('exist').click();
    cy.get('div[data-automation-key="bvr_name"] input').eq(0).type('CypressTest2');
    cy.get('[data-icon-name="Save"]').should('exist').click();
    cy.get('div[class^="ms-Stack loading"]').should('have.css', 'display', 'none');

    cy.get('.ms-DetailsRow-fields').eq(0).should('exist').dblclick({ force: true });
    cy.get('div[title="E2E Test Editable Table"]').should('exist');
  });

  // it.only('test create record', () => {
  //   // cy.get('[data-id="tablist-tab_3"]').should('exist').click();
  //   cy.get('[data-icon-name="Add"]').should('be.visible').click();

  //   cy.get('div[data-automation-key="bvr_name"] input').eq(0).type('CypressDeleteTest');

  //   cy.get('[data-icon-name="Save"]').should('be.visible').click();
  //   cy.wait(7000);
  // });

  // it(`Should resize a column and check if its width is correct`, () => {

  //   cy.get('.ms-DetailsHeader-cellSizer').eq(0)
  //     .then(el => {
  //       const rect = el[0].getBoundingClientRect();
  //       const pageYDragAmount = 200;

  //       cy.window().then(window => {
  //         const pageY = rect.top + window.scrollY;

  //         cy.wrap(el)
  //           .trigger('mouseover', {
  //             force: true,
  //           })
  //           .trigger('mousedown', {
  //             which: 1,
  //             pageX: rect.left,
  //             pageY,
  //             force: true,
  //           })
  //           .trigger('mousemove', {
  //             pageX: rect.left,
  //             pageY: pageY + pageYDragAmount,
  //             force: true,
  //             position: 'center',
  //           })
  //           .trigger('mousemove')
  //           .trigger('mouseup', {
  //             which: 1,
  //             force: true,
  //           });
  //       });
  //     });
  //   // cy.get('[data-item-key="bvr_booltest"]').then($div => {
  //   //   const initialWidth = Cypress.$($div).width();
  //   //   const resizeValue = 200;
  //   //   cy.get('.ms-DetailsHeader-cellSizer').eq(0)
  //   //     .trigger('mousedown')
  //   //     .wait(1500)
  //   //     .trigger('mousemove', {
  //   //       clientX: 700,

  //   //     })
  //   //     .trigger('mouseup', { force: true });
  //   //   cy.get('[data-item-key="bvr_booltest"]').should($divAfterResize => {
  //   //     const finalWidth = Cypress.$($divAfterResize).width();

  //   //     expect(finalWidth).to.equal(initialWidth + resizeValue);
  //   //   });
  //   // });
  // });

  it('Should click on New button (records count=6) -> check for Scrollable Pane visibility', () => {
    cy.get('[data-icon-name="Add"]').should('exist').click();
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

  it(`Should check for dateTime correct convertions`, () => {
    cy.fixture('dateTimeData').then(testData => {
      testData.user2.forEach((data: DateTimeData) => {
        cy.assertFieldValues(data);
      });
    });
  });
});
