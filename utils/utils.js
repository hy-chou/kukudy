const { dirname } = require('node:path');
const { appendFile, mkdir } = require('node:fs/promises');

const getTS = () => new Date().toISOString();

const sleep = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const url2hostname = (url) => {
  const p = url.indexOf('://') + 3;
  const q = url.indexOf('/', p);

  return url.slice(p, q);
};

const parseExtXTwitchInfo = (usherM3U8) => {
  const info = usherM3U8
    .split('\n')
    .find((line) => line.startsWith('#EXT-X-TWITCH-INFO:'))
    .slice(19)
    .split(',')
    .map((kv) => {
      const p = kv.indexOf('=');
      return [kv.slice(0, p), kv.slice(p + 2, -1)];
    });

  return Object.fromEntries(info);
};

const writeData = (path, data) =>
  mkdir(dirname(path), { recursive: true }).then(() => appendFile(path, data));

module.exports = {
  getTS,
  sleep,
  url2hostname,
  parseExtXTwitchInfo,
  writeData,
};
