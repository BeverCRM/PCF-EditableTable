import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://bevertest.crm4.dynamics.com',
    experimentalModifyObstructiveThirdPartyCode: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 15000,
  },
});
