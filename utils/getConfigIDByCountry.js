/* eslint-disable no-console */
const axios = require('axios');

const idOfCountry = {
  AE: 226,
  AL: 2,
  AR: 10,
  AT: 14,
  AU: 13,
  BA: 27,
  BE: 21,
  BG: 33,
  BR: 30,
  CA: 38,
  CH: 209,
  CL: 43,
  CO: 47,
  CR: 52,
  CY: 56,
  CZ: 57,
  DE: 81,
  DK: 58,
  EE: 68,
  ES: 202,
  FI: 73,
  FR: 74,
  GB: 227,
  GE: 80,
  GR: 84,
  HK: 97,
  HR: 54,
  HU: 98,
  ID: 101,
  IE: 104,
  IL: 105,
  IS: 99,
  IT: 106,
  JP: 108,
  KR: 114,
  LT: 125,
  LU: 126,
  LV: 119,
  MD: 142,
  MK: 128,
  MX: 140,
  MY: 131,
  NL: 153,
  NO: 163,
  NZ: 156,
  PL: 174,
  PT: 175,
  RO: 179,
  RS: 192,
  SE: 208,
  SG: 195,
  SI: 197,
  SK: 196,
  TH: 214,
  TR: 220,
  TW: 211,
  UA: 225,
  UK: 227, // GB
  US: 228,
  VN: 234,
  ZA: 200,
};

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
  console.error(`${new Date().toISOString()}\t`
                + `getConfigIDByCountry.js: invalid argument "${process.argv[2]}"`);
  errorMessage.forEach((line) => console.error(line));
  process.exit(1);
}

axios.get('https://nordvpn.com/wp-admin/admin-ajax.php', {
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
