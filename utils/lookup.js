/* eslint-disable no-console */
const dnsPromises = require('node:dns').promises;

const { getTS } = require('./utils');

const hostnames = ['api.twitch.tv', 'gql.twitch.tv', 'usher.ttvnw.net'];

hostnames.forEach((hostname) => {
  dnsPromises
    .resolve(hostname)
    .then((addresses) => {
      console.log(`${getTS()}\tlookup.js:  ${hostname} ${addresses}`);
    })
    .catch((error) => {
      console.error(`${getTS()}\tlookup.js:  ${error}`);
    });
});
