const https = require('node:https');
const axios = require('axios');
const envResult = require('dotenv').config({ path: '../.env' });

if (envResult.error) throw envResult.error;

const { writeData, getTS } = require('./utils');

const tsZ = getTS().replaceAll(':', '.');

const kaxios = axios.create({
  timeout: 150_000,
  httpsAgent: new https.Agent({ keepAlive: true }),
});

kaxios.interceptors.response.use(
  (response) => {
    const ts2 = getTS();
    const { method, param, ts1 } = response.config.kukudy;

    writeData(
      `./dumps/${method}/${tsZ}.tsv`,
      `${ts1}\t${ts2}\t${param}\t` +
        `${JSON.stringify(response.headers)}\t` +
        `${JSON.stringify(response.data)}\n`
    );
    return response;
  },
  async (error) => {
    const ts2 = getTS();
    const { method, param, ts1 } = error.config.kukudy;
    const dumpsEPath = `./dumps/E${method}/${tsZ}.tsv`;

    if (error.response) {
      writeData(
        dumpsEPath,
        `${ts1}\t${ts2}\t${param}\t${error.code}\t${error.message}\t` +
          `${JSON.stringify(error.response.data)}\t` +
          `${JSON.stringify(error.response.status)}\t` +
          `${JSON.stringify(error.response.headers)}\n`
      );
    } else {
      writeData(
        dumpsEPath,
        `${ts1}\t${ts2}\t${param}\t${error.code}\t${error.message}\n`
      );
    }
    return Promise.reject(error.code);
  }
);

class KAPI {
  static reqStreams = (cursor = '') => {
    const url = 'https://api.twitch.tv/helix/streams';
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        'Client-Id': process.env.CLIENT_ID,
      },
      params: {
        first: 100,
        after: cursor,
      },

      kukudy: {
        method: 'reqStreams',
        param: cursor,
        ts1: getTS(),
      },
    };

    return kaxios.get(url, config);
  };

  static reqSpecificStreams = (watchlist) => {
    const url = 'https://api.twitch.tv/helix/streams';
    const query = `?${watchlist.map((u) => `user_login=${u}`).join('&')}`;
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        'Client-Id': process.env.CLIENT_ID,
      },

      kukudy: {
        method: 'reqSpecificStreams',
        param: JSON.stringify(watchlist),
        ts1: getTS(),
      },
    };

    return kaxios.get(url + query, config);
  };

  static reqPlaybackAccessToken = (userLogin) => {
    const url = 'https://gql.twitch.tv/gql';
    const data = JSON.stringify({
      operationName: 'PlaybackAccessToken_Template',
      query:
        'query PlaybackAccessToken_Template($login: String!, $isLive: Boolean!, $vodID: ID!, $isVod: Boolean!, $playerType: String!) {  streamPlaybackAccessToken(channelName: $login, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isLive) {    value    signature    __typename  }  videoPlaybackAccessToken(id: $vodID, params: {platform: "web", playerBackend: "mediaplayer", playerType: $playerType}) @include(if: $isVod) {    value    signature    __typename  }}',
      variables: {
        isLive: true,
        login: userLogin,
        isVod: false,
        vodID: '',
        playerType: 'site',
      },
    });
    const config = {
      headers: { 'Client-Id': process.env.CLIENT_ID_GQL },

      kukudy: {
        method: 'reqPlaybackAccessToken',
        param: userLogin,
        ts1: getTS(),
      },
    };

    return kaxios.post(url, data, config);
  };

  static reqUsherM3U8 = (sPAToken, userLogin) => {
    const url = `https://usher.ttvnw.net/api/channel/hls/${userLogin}.m3u8`;
    const config = {
      params: {
        token: sPAToken.value,
        sig: sPAToken.signature,
      },

      kukudy: {
        method: 'reqUsherM3U8',
        param: userLogin,
        ts1: getTS(),
      },
    };

    return kaxios.get(url, config);
  };

  static reqGet = (url) => {
    const config = {
      kukudy: {
        method: 'reqGet',
        param: url,
        ts1: getTS(),
      },
    };
    return kaxios.get(url, config);
  };
}

module.exports = KAPI;
