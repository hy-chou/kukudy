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

const countryOfCity = {
  vienna: 'AT',
  prague: 'CZ',
  berlin: 'DE',
  frankfurt: 'DE',
  copenhagen: 'DK',
  madrid: 'ES',
  helsinki: 'FI',
  marseille: 'FR',
  paris: 'FR',
  milan: 'IT',
  amsterdam: 'NL',
  oslo: 'NO',
  warsaw: 'PL',
  stockholm: 'SE',
  taipei: 'TW',
  london: 'UK',
};

const niceConfigIDs = new Set(
  'at120',
  'at130',
  'cz98',
  'cz126',
  'cz127',
  'cz130',
  'cz132',
  'cz133',
  'cz137',
  'cz140',
  'cz142',
  'cz145',
  'cz149',
  'cz150',
  'de775',
  'de776',
  'de806',
  'de823',
  'de825',
  'de851',
  'de975',
  'de1075',
  'de1076',
  'de1081',
  'de1086',
  'de1090',
  'dk247',
  'dk248',
  'dk249',
  'dk250',
  'dk251',
  'dk252',
  'dk253',
  'dk254',
  'dk255',
  'es204',
  'es206',
  'fi179',
  'fi180',
  'fi181',
  'fi182',
  'fi183',
  'fi184',
  'fi185',
  'fi186',
  'fi187',
  'fi188',
  'fi189',
  'fi190',
  'fi191',
  'fi192',
  'fi193',
  'fi194',
  'fi195',
  'fi196',
  'fi197',
  'fi198',
  'fi199',
  'fi200',
  'fr553',
  'fr671',
  'fr758',
  'fr761',
  'fr767',
  'fr773',
  'fr796',
  'fr801',
  'fr803',
  'fr855',
  'fr867',
  'it157',
  'it191',
  'it196',
  'it201',
  'it223',
  'it233',
  'it238',
  'nl720',
  'nl828',
  'nl841',
  'nl847',
  'nl881',
  'nl917',
  'nl960',
  'nl979',
  'no194',
  'no199',
  'pl200',
  'pl213',
  'se492',
  'se546',
  'se596',
  'uk1900',
  'uk2106',
  'uk2213',
  'uk2218',
  'uk2219',
  'uk2254',
  'uk2302',
  'uk2319'
);

module.exports = { idOfCountry, countryOfCity, niceConfigIDs };
