const https = require('node:https');
const axios = require('axios');
const envResult = require('dotenv').config({ path: '../.env' });

if (envResult.error) throw envResult.error;

const { writeData, getTS } = require('./utils');

const kaxios = axios.create({
  timeout: 150_000,
  httpsAgent: new https.Agent({ keepAlive: true }),
});

kaxios.interceptors.response.use(
  async (response) => {
    const t2 = getTS();
    const ts2H = t2.slice(0, 13);
    const { type, t1 } = response.config.kukudy;
    const rtt = Date.parse(t2) - Date.parse(t1);

    await writeData(
      `./logs/rtts/${ts2H}.tsv`,
      `${t1}\t${rtt / 1000}\t${type}\n`,
    );
    await writeData(
      `./logs/hdrs/${ts2H}/${type}.json.tsv`,
      `${t1}\t${JSON.stringify(response.headers)}\n`,
    );

    return response;
  },
  async (error) => {
    const t2 = getTS();
    const ts2H = t2.slice(0, 13);
    const { type, t1 } = error.config.kukudy;
    const rtt = Date.parse(t2) - Date.parse(t1);

    await writeData(
      `./logs/rtts/${ts2H}.tsv`,
      `${t1}\t${rtt / 1000}\t${type}\t${error.code} ${error.message}\n`,
    );
    await writeData(
      `./errs/${ts2H}.tsv`,
      `${t1}\t${type}\t${error.code}\t${error.message}\n`,
    );
    return Promise.reject(error);
  },
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
        type: 'reqStreams',
        t1: getTS(),
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
        type: 'reqSpecificStreams',
        t1: getTS(),
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
        type: 'reqPAT',
        t1: getTS(),
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
        type: 'reqUsherM3U8',
        t1: getTS(),
      },
    };

    return kaxios.get(url, config);
  };

  static reqGet = (url) => {
    const config = {
      kukudy: {
        type: 'reqGet',
        t1: getTS(),
      },
    };
    return kaxios.get(url, config);
  };
}

module.exports = KAPI;
