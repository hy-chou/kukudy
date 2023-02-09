const { readdir, readFile } = require('node:fs/promises');

const KAPI = require('./utils/API');
const { getTS, writeData, sleep } = require('./utils/utils');

const loadUserLogins = async () => {
  const file = await readdir('./ulgs')
    .then((files) => files.at(-1))
    .catch(() => []);

  return readFile(`./ulgs/${file}`, 'utf-8')
    .then((content) => content.slice(0, -1).split('\n'));
};

const updateEdges = async () => {
  const ts0 = getTS().replaceAll(':', '.');
  const dumpPath = `./dump/getVEH/${ts0}.tsv`;

  const userLogins = await loadUserLogins();

  userLogins.forEach(async (userLogin, index) => {
    await sleep(index * 40); // 25 Hz

    try {
      const ts1 = getTS();
      const resPAT = await KAPI.reqPlaybackAccessToken(userLogin);
      const ts2 = getTS();

      writeData(
        dumpPath,
        `${ts1}\t${ts2}\treqPAT\t${userLogin}\t`
          + `${JSON.stringify(resPAT.headers)}\t`
          + `${JSON.stringify(resPAT.data)}\n`,
      );

      const sPAToken = resPAT.data.data.streamPlaybackAccessToken;
      const ts3 = getTS();
      const resUsherM3U8 = await KAPI.reqUsherM3U8(sPAToken, userLogin);
      const ts4 = getTS();

      writeData(
        dumpPath,
        `${ts3}\t${ts4}\treqUsherM3U8\t${userLogin}\t`
            + `${JSON.stringify(resUsherM3U8.headers)}\t`
            + `${JSON.stringify(resUsherM3U8.data)}\n`,
      );
    } catch (error) {
      // continue regardless of error
    }
  });
};

if (require.main === module) {
  updateEdges();
}
