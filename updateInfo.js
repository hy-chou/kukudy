const { readdir, readFile } = require('node:fs/promises');

const KAPI = require('./utils/API');
const {
  getTS, writeData, sleep, parseExtXTwitchInfo,
} = require('./utils/utils');

const loadUserLogins = async () => {
  const file = await readdir('./ulgs')
    .then((files) => files.at(-1))
    .catch(() => []);

  return readFile(`./ulgs/${file}`, 'utf-8')
    .then((content) => content.slice(0, -1).split('\n'));
};

const getEdgeInfo = async (userLogin) => {
  try {
    const resPAT = await KAPI.reqPlaybackAccessToken(userLogin);
    const sPAToken = resPAT.data.data.streamPlaybackAccessToken;
    const resUsher = await KAPI.reqUsherM3U8(sPAToken, userLogin);
    const info = parseExtXTwitchInfo(resUsher.data);

    return info;
  } catch (error) {
    if (error.response) {
      return {
        headers: error.response.headers,
        data: error.response.data,
      };
    }
    return error.message;
  }
};

const updateInfo = async () => {
  const ts = getTS().replaceAll(':', '.');
  const infoPath = `./info/${ts}.tsv`;

  const userLogins = await loadUserLogins();

  userLogins.forEach(async (userLogin, index) => {
    await sleep(index * 40); // 25 Hz

    const info = await getEdgeInfo(userLogin);

    writeData(infoPath, `${getTS()}\t${userLogin}\t${JSON.stringify(info)}\n`);
  });
};

if (require.main === module) {
  updateInfo();
}
