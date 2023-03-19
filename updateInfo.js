/* eslint-disable no-console */
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

const checkCountry = async (targetCountry) => {
  let i = 0;
  const userLogins = await loadUserLogins();

  while (i < userLogins.length) {
    // eslint-disable-next-line no-await-in-loop
    const info = await getEdgeInfo(userLogins[i]);

    const userCountry = info['USER-COUNTRY'];
    const userIP = info['USER-IP'];

    if (userCountry === undefined) {
      i += 1;
    } else {
      if (userCountry === targetCountry) {
        console.log(`${getTS()}\tcheckCountry: ${userCountry} (${userIP})`);
      } else {
        console.error(
          `${getTS()}\t` +
            `checkCountry: expect ${targetCountry}, get ${userCountry} instead (${userIP})`
        );
        process.exitCode = 1;
      }
      break;
    }
  }
};

if (require.main === module) {
  const pargv = process.argv;

  if (pargv.length === 2) {
    updateInfo();
  } else if (pargv.length === 3) {
    let targetCountry = pargv[2].slice(0, 2).toUpperCase();

    if (targetCountry === 'UK') targetCountry = 'GB';

    checkCountry(targetCountry);
  }
}
