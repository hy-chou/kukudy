/* eslint-disable no-console */
const axios = require('axios');
const { idOfCountry } = require('./lists');

const errorMessage = [
  '',
  'SYNOPSIS',
  '  node getConfigIDByCountry.js COUNTRY',
  '',
  'NOTE',
  `  valid COUNTRY:  ${Object.keys(idOfCountry)}`,
  '',
];

if (process.argv.length !== 3) {
  errorMessage.forEach((line) => console.error(line));
  process.exit(1);
}

const country = process.argv[2].toUpperCase();
const countryID = idOfCountry[country];

if (countryID === undefined) {
  console.error(
    `${new Date().toISOString()}\t` +
      `getConfigIDByCountry.js: invalid argument "${process.argv[2]}"`
  );
  errorMessage.forEach((line) => console.error(line));
  process.exit(1);
}

axios
  .get('https://nordvpn.com/wp-admin/admin-ajax.php', {
    params: {
      action: 'servers_recommendations',
      filters: {
        country_id: countryID,
        servers_technologies: [3],
      },
      // limit: 9999,
    },
  })
  .then((res) => res.data[0].hostname)
  .then((sr) => console.log(sr));
