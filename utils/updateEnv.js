const axios = require('axios');
const { getTS, writeData } = require('./utils');

require('dotenv').config({ path: '../.env' });

if (require.main === module) {
  axios
    .post('https://id.twitch.tv/oauth2/token', {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: 'client_credentials',
    })
    .then((res) => res.data.access_token)
    .then(async (token) => {
      const ts = getTS();
      await writeData('../.env', `ACCESS_TOKEN="${token}"  # ${ts}\n`);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      process.exitCode = 1;
    });
}
