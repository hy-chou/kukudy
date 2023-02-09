/* eslint-disable no-console */
const axios = require('axios');

const countryCodes = {
  AL: 2,
  AR: 10,
  AU: 13,
  AT: 14,
  BE: 21,
  BA: 27,
  BR: 30,
  BG: 33,
  CA: 38,
  CL: 43,
  CR: 52,
  HR: 54,
  CY: 56,
  CZ: 57,
  DK: 58,
  EE: 68,
  FI: 73,
  FR: 74,
  GE: 80,
  DE: 81,
  GR: 84,
  HK: 97,
  HU: 98,
  IS: 99,
  ID: 101,
  IE: 104,
  IL: 105,
  IT: 106,
  JP: 108,
  KR: 114,
  LV: 119,
  LT: 125,
  LU: 126,
  MK: 128,
  MY: 131,
  MX: 140,
  MD: 142,
  NL: 153,
  NZ: 156,
  NO: 163,
  PL: 174,
  PT: 175,
  RO: 179,
  RS: 192,
  SG: 195,
  SK: 196,
  SI: 197,
  ZA: 200,
  ES: 202,
  SE: 208,
  CH: 209,
  TW: 211,
  TH: 214,
  TR: 220,
  UA: 225,
  UK: 227,
  US: 228,
  VN: 234,
};

const country = process.argv[2].toUpperCase();
const countryID = countryCodes[country];

if (countryID === undefined) {
  console.error(`bad country code:  ${country}`);
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
  .then((res) => console.log(res.data[0].hostname));
