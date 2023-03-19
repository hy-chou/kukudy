const { readdir, readFile } = require('node:fs/promises');

const KAPI = require('./utils/API');
const {
  getTS,
  writeData,
  sleep,
  parseExtXTwitchInfo,
} = require('./utils/utils');

const loadUserLogins = async () => {
  const file = await readdir('./ulgs')
    .then((files) => files.at(-1))
    .catch(() => []);

  return readFile(`./ulgs/${file}`, 'utf-8').then((content) =>
    content.slice(0, -1).split('\n')
  );
};

const getEdgeInfo = async (userLogin) => {
  try {
    const resPAT = await KAPI.reqPlaybackAccessToken(userLogin);
    const sPAToken = resPAT.data.data.streamPlaybackAccessToken;
    const resUsher = await KAPI.reqUsherM3U8(sPAToken, userLogin);
    const info = parseExtXTwitchInfo(resUsher.data);

    return info;
  } catch (errorCode) {
    return errorCode;
  }
};

const updateInfo = async (targetCountry) => {
  const ts = getTS().replaceAll(':', '.');
  const infoPath = `./info/${ts}.tsv`;

  const userLogins = await loadUserLogins();

  userLogins.forEach(async (userLogin, index) => {
    await sleep(index * 40); // 25 Hz

    const info = await getEdgeInfo(userLogin);

    if (targetCountry !== undefined && info['USER-COUNTRY'] !== undefined) {
      if (info['USER-COUNTRY'] !== targetCountry) {
        // eslint-disable-next-line no-console
        console.error(
          `${getTS()}\t` +
            `uI: want ${targetCountry}, ` +
            `get ${info['USER-COUNTRY']} ${info['USER-IP']} instead`
        );
        process.exit(1);
      }
    }

    writeData(infoPath, `${getTS()}\t${userLogin}\t${JSON.stringify(info)}\n`);
  });
};

if (require.main === module) {
  const pargv = process.argv;

  if (pargv.length === 2) {
    updateInfo();
  } else if (pargv.length === 3) {
    let targetCountry = pargv[2].slice(0, 2).toUpperCase();

    if (targetCountry === 'UK') targetCountry = 'GB';

    updateInfo(targetCountry);
  }
}
