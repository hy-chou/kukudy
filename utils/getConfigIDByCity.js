/* eslint-disable no-console */
const axios = require('axios');
const { idOfCountry, countryOfCity } = require('./lists');

const errorMessage = [
  '',
  'SYNOPSIS',
  '  node getConfigIDByCity.js CITY',
  '',
  'NOTE',
  `  valid CITY:  ${Object.keys(countryOfCity)}`,
  '',
];

if (process.argv.length !== 3) {
  errorMessage.forEach((line) => console.error(line));
  process.exit(1);
}

const city = process.argv[2].toLowerCase();
const country = countryOfCity[city];

if (country === undefined) {
  console.error(`${new Date().toISOString()}\t`
                + `getConfigIDByCity.js: invalid argument "${process.argv[2]}"`);
  errorMessage.forEach((line) => console.error(line));
  process.exit(1);
}

axios.get('https://nordvpn.com/wp-admin/admin-ajax.php', {
  params: {
    action: 'servers_recommendations',
    filters: {
      country_id: idOfCountry[country],
      servers_technologies: [3],
    },
    limit: 9999,
  },
})
  .then((res) => res.data
    .find((item) => item.locations[0].country.city.name.toLowerCase() === city)
    .hostname)
  .then((sr) => console.log(sr));
