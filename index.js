'use strict';

const puppeteer = require('puppeteer');

/*=================================
=      ENTER YOUR DETAILS HERE    =
=================================*/
const USER = {
  EIN1: 'XX', // First two digits of your Employer Identification Number (EIN)
  EIN2: 'XXXXXXX', // Last seven digits of your Employer Identification Number (EIN)
  PIN: 'XXXX', // 4-digit PIN
  PASSWORD: 'XXXXXXXX', // Password
};

const TAX_PAYMENT = {
  PAYMENT_AMOUNT: '1', // The quarterly tax amount. For example, enter "500" for $500 (must be a string)
  TAX_PERIOD: '2022', // The tax period year (must be a string)
  SETTLEMENT_DATE: '04/15/2022', // The settlement date (must be a string)
};

/*=================================
=            Constants            =
=================================*/
const JQUERY_FILE_PATH = 'jquery.js';
const PUPPETEER_LAUNCH_CONFIG = {
  headless: false
};
// Webpages
const PAGES = {
  HOME: 'https://www.eftps.gov/eftps/',
};

// These are the on-page HTML selectors for the login page and logged-in-flow pages. Because Octal numeric literals are not allowed
// need to always escape. For example, see FEDERAL_TAX_DEPOSIT_RADIO_OPTION (the '\36' became '\\36').
// @see https://stackoverflow.com/a/36880308
const PAGE_SELECTORS = {
  LOGIN_LINK_IN_NAV: '#header > div.line > ul > li.unit.size7of7 > a',
  EIN1_FIELD: '#LoginForm > div > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td.autoTab > input:nth-child(1)',
  EIN2_FIELD: '#LoginForm > div > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(1) > td.autoTab > input:nth-child(2)',
  PIN_FIELD: '#LoginForm > div > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(4) > td:nth-child(2) > input',
  PASSWORD_FIELD: '#LoginForm > div > table:nth-child(1) > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(5) > td:nth-child(2) > input[type=password]',
  LOGIN_LINK_IN_LOGIN_FORM: '#LoginForm > div > table.midButtonContainer > tbody > tr > td:nth-child(2) > input',
  SUCCESSFULLY_LOGGED_IN_TEXT: '#content-container > table > tbody > tr:nth-child(1) > td:nth-child(2) > div > p.tagline-blue',
  PAYMENTS_LINK_IN_NAV: '#header > div.line > ul > li.unit.size4of7.borderRight > a',
  ENTER_TAX_FORM_NUMBER_FIELD: '#TaxForm_EditField',
  NEXT_LINK_IN_TAX_PAYMENT_FORM: '#content-container > table > tbody > tr:nth-child(1) > td:nth-child(2) > form > fieldset > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > table.buttonContainer > tbody > tr > td:nth-child(2) > input',
  FEDERAL_TAX_DEPOSIT_RADIO_OPTION: 'input[type="radio"][name="taxType"]#\\36',
  NEXT_LINK_IN_TAX_TYPE_SELECTION_RADIO_LIST: '#content-container > table > tbody > tr:nth-child(1) > td:nth-child(2) > form > fieldset > table > tbody > tr > td:nth-child(3) > table > tbody > tr > td > table.buttonContainer > tbody > tr > td:nth-child(3) > input',
  PAYMENT_AMOUNT_FIELD: 'input[id="singlePayment.amount.value"',
  TAX_PERIOD_FIELD: '#content-container > table > tbody > tr:nth-child(1) > td:nth-child(2) > table:nth-child(8) > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(3) > td > table.formContainer.payment-table > tbody > tr:nth-child(2) > td.txt-body > input',
  SETTLEMENT_DATE_FIELD: '#paymentField[name="singlePayment.settlementDate.dateString"]',
  NEXT_LINK_IN_BUSINESS_TAX_PAYMENT: '#content-container > table > tbody > tr:nth-child(1) > td:nth-child(2) > table:nth-child(8) > tbody > tr > td:nth-child(3) > table > tbody > tr:nth-child(3) > td > table.buttonContainer > tbody > tr > td:nth-child(4) > input',
  MAKE_PAYMENT_LINK: '#content-container > table > tbody > tr:nth-child(1) > td:nth-child(2) > table:nth-child(7) > tbody > tr > td:nth-child(2) > form > table > tbody > tr:nth-child(2) > td:nth-child(3) > input[type=image]'
};

const PAGE_X_PATHS = {
  FEDERAL_TAX_DEPOSIT_RADIO_OPTION: '//*[@id="6"]',
  NEXT_LINK_IN_BUSINESS_TAX_PAYMENT: '//*[@id="content-container"]/table/tbody/tr[1]/td[2]/table[3]/tbody/tr/td[2]/table/tbody/tr[3]/td/table[2]/tbody/tr/td[4]/input',
  MAKE_PAYMENT_LINK: '//*[@id="content-container"]/table/tbody/tr[1]/td[2]/table[2]/tbody/tr/td[2]/form/table/tbody/tr[2]/td[3]/input',
};

const user = {
  loginDetails: {
    ein1: USER.EIN1,
    ein2: USER.EIN2,
    pin: USER.PIN,
    password: USER.PASSWORD
  }
};

const taxPayment = {
  paymentAmount: TAX_PAYMENT.PAYMENT_AMOUNT,
  taxPeriod: TAX_PAYMENT.TAX_PERIOD,
  settlementDate: TAX_PAYMENT.SETTLEMENT_DATE
};


/*======================================
=            MEAT FUNCTIONS            =
======================================*/
(async () => {

  const browser = await puppeteer.launch(PUPPETEER_LAUNCH_CONFIG);
  const page = await browser.newPage();
  await page.goto(PAGES.HOME);

  /*============================
  =            HOME            =
  ============================*/
  await page.waitForSelector(PAGE_SELECTORS.LOGIN_LINK_IN_NAV); // Need to wait for an element to load: login link in nav
  await page.addScriptTag({path: JQUERY_FILE_PATH}); // Add jQuery

  // Navigate to the login page
  await page.evaluate( (pageSelectors) => {
    const loginLinkInNav = $(pageSelectors.LOGIN_LINK_IN_NAV)[0];
    loginLinkInNav.click();
  }, PAGE_SELECTORS );

  /*=============================
  =            LOGIN            =
  =============================*/
  await page.waitForSelector(PAGE_SELECTORS.EIN1_FIELD); // Need to wait for an element to load: EIN1 field
  await page.addScriptTag({path: JQUERY_FILE_PATH}); // Add jQuery

  // Enter details into the Login form and press login
  await page.evaluate( (pageSelectors, userData) => {
    const ein1Field = $(pageSelectors.EIN1_FIELD)[0];
    const ein2Field = $(pageSelectors.EIN2_FIELD)[0];
    const pinField = $(pageSelectors.PIN_FIELD)[0];
    const passwordField = $(pageSelectors.PASSWORD_FIELD)[0];
    const loginLinkInLoginForm = $(pageSelectors.LOGIN_LINK_IN_LOGIN_FORM)[0];

    ein1Field.value = userData.loginDetails.ein1;
    ein2Field.value = userData.loginDetails.ein2;
    pinField.value = userData.loginDetails.pin;
    passwordField.value = userData.loginDetails.password;

    loginLinkInLoginForm.click();
  }, PAGE_SELECTORS, user );

  /*==============================================
  =            SUCCESSFULLY LOGGED IN            =
  ==============================================*/
  await page.waitForSelector(PAGE_SELECTORS.SUCCESSFULLY_LOGGED_IN_TEXT); // Need to wait for an element to load: 'successfully logged in' text
  await page.addScriptTag({path: JQUERY_FILE_PATH}); // Add jQuery

  // Navigate to the payments tab once logged in
  await page.evaluate( (pageSelectors) => {
    const paymentsLinkInNav = $(pageSelectors.PAYMENTS_LINK_IN_NAV)[0];
    paymentsLinkInNav.click();
  }, PAGE_SELECTORS );

  /*==========================================
  =            MAKE A TAX PAYMENT            =
  ==========================================*/
  await page.waitForSelector(PAGE_SELECTORS.ENTER_TAX_FORM_NUMBER_FIELD); // Need to wait for an element to load: 'enter tax form number' field
  await page.addScriptTag({path: JQUERY_FILE_PATH}); // Add jQuery

  // Enter details into the 'Enter Tax Form Number' form and click Next
  await page.evaluate( (pageSelectors, userData) => {
    const CORPORATE_INCOME_TAX_RETURN_NUMBER = '1120'; // This is the 'Corporate Income Tax Return' number

    const enterTaxFormNumberField = $(pageSelectors.ENTER_TAX_FORM_NUMBER_FIELD)[0];
    const nextLinkInTaxPaymentForm = $(pageSelectors.NEXT_LINK_IN_TAX_PAYMENT_FORM)[0];

    enterTaxFormNumberField.value = CORPORATE_INCOME_TAX_RETURN_NUMBER;

    nextLinkInTaxPaymentForm.click();
  }, PAGE_SELECTORS, user );

  /*==========================================
  =            TAX TYPE SELECTION            =
  ==========================================*/
  // Need to specifically use waitForXPath() here instead of waitForSelector() because the ID target is '#6', which will break puppeteer because it's a number ID.
  await page.waitForXPath(PAGE_X_PATHS.FEDERAL_TAX_DEPOSIT_RADIO_OPTION); // Need to wait for an element to load: 'Federal Tax Deposit' radio option
  await page.addScriptTag({path: JQUERY_FILE_PATH}); // Add jQuery

  // Select the radio 'Enter Tax Form Number' form and click Next
  await page.evaluate( (pageSelectors, userData) => {
    const federalTaxDepositRadioOption = $(pageSelectors.FEDERAL_TAX_DEPOSIT_RADIO_OPTION)[0];
    const nextLinkInTaxTypeSelectionRadioList = $(pageSelectors.NEXT_LINK_IN_TAX_TYPE_SELECTION_RADIO_LIST)[0];

    federalTaxDepositRadioOption.click();
    nextLinkInTaxTypeSelectionRadioList.click();
  }, PAGE_SELECTORS, user );

  /*============================================
  =            BUSINESS TAX PAYMENT            =
  ============================================*/
  // Need to specifically use waitForXPath() here instead of waitForSelector() b/c sometimes puppeteer breaks at this evaluate() block due to the 'Next' button being undefined when trying to use jQuery click()
  await page.waitForXPath(PAGE_X_PATHS.NEXT_LINK_IN_BUSINESS_TAX_PAYMENT); // Need to wait for an element to load: 'next' button
  await page.addScriptTag({path: JQUERY_FILE_PATH}); // Add jQuery

  // Enter the business tax payment details into the form and click Next
  await page.evaluate( (pageSelectors, taxPaymentData) => {
    const paymentAmountField = $(pageSelectors.PAYMENT_AMOUNT_FIELD)[0];
    const taxPeriodField = $(pageSelectors.TAX_PERIOD_FIELD)[0];
    const settlementDateField = $(pageSelectors.SETTLEMENT_DATE_FIELD)[0];
    const nextLinkInBusinessTaxPaymentForm = $(pageSelectors.NEXT_LINK_IN_BUSINESS_TAX_PAYMENT)[0];

    paymentAmountField.value = taxPaymentData.paymentAmount;
    taxPeriodField.value = taxPaymentData.taxPeriod;
    settlementDateField.value = taxPaymentData.settlementDate;

    nextLinkInBusinessTaxPaymentForm.click();
  }, PAGE_SELECTORS, taxPayment );

  /*==================================================
  =            VERIFY PAYMENT INFORMATION            =
  ==================================================*/
  // Need to specifically use waitForXPath() here instead of waitForSelector() in case puppeteer might break at this evaluate() block due to the 'Make Payment' button potentially being undefined when trying to use jQuery click()
  await page.waitForXPath(PAGE_X_PATHS.MAKE_PAYMENT_LINK); // Need to wait for an element to load: 'Make Payment' button
  await page.addScriptTag({path: JQUERY_FILE_PATH}); // Add jQuery

  // Confirm the details and click Next
  await page.evaluate( (pageSelectors) => {
    const nextLinkInBusinessTaxPaymentForm = $(pageSelectors.MAKE_PAYMENT_LINK)[0];

    // Uncomment the following line to make the payment (instead of seeing the confirmation details)
    // nextLinkInBusinessTaxPaymentForm.click();
  }, PAGE_SELECTORS );

  // Uncomment the following line to close the browser window
  // await browser.close();
})();