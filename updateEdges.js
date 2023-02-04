const { readdir, readFile } = require('node:fs/promises');

const KAPI = require('./utils/API');
const {
  getTS, url2hostname, writeData, sleep,
} = require('./utils/utils');

const getVideoEdgeHostname = (userLogin) => KAPI.reqPlaybackAccessToken(userLogin)
  .then(async (res) => {
    const ts = getTS();
    const strHeaders = JSON.stringify(res.headers);
    const strData = JSON.stringify(res.data);
    await writeData(
      `./dump/getVEH/${ts.slice(0, 13)}.tsv`,
      `${ts}\t${userLogin}\treqPAT\t${strHeaders}\t${strData}\n`,
    );
    return res.data.data.streamPlaybackAccessToken;
  })
  .then((sPAToken) => KAPI.reqUsherM3U8(sPAToken, userLogin))
  .then(async (res) => {
    const ts = getTS();
    const strHeaders = JSON.stringify(res.headers);
    const strData = JSON.stringify(res.data);
    await writeData(
      `./dump/getVEH/${ts.slice(0, 13)}.tsv`,
      `${ts}\t${userLogin}\treqUsher\t${strHeaders}\t${strData}\n`,
    );
    return res.data;
  })
  .then((usherM3U8) => usherM3U8.split('\n').find((line) => line[0] !== '#'))
  .then((weaverURL) => KAPI.reqGet(weaverURL))
  .then(async (res) => {
    const ts = getTS();
    const strHeaders = JSON.stringify(res.headers);
    const strData = JSON.stringify(res.data);
    await writeData(
      `./dump/getVEH/${ts.slice(0, 13)}.tsv`,
      `${ts}\t${userLogin}\treqWeaver\t${strHeaders}\t${strData}\n`,
    );
    return res.data;
  })
  .then((weaverM3U8) => weaverM3U8.split('\n').find((line) => line[0] !== '#'))
  .then((edgeURL) => url2hostname(edgeURL))
  .catch((err) => err.message);

const loadUserLogins = async () => {
  const file = await readdir('./ulgs')
    .then((files) => files.at(-1))
    .catch(() => []);

  return readFile(`./ulgs/${file}`, 'utf-8')
    .then((content) => content.slice(0, -1).split('\n'));
};

const updateEdges = async () => {
  const ts = getTS().replaceAll(':', '.');
  const edgsPath = `./edgs/${ts}.tsv`;

  await loadUserLogins()
    .then((userLogins) => userLogins.forEach(async (userLogin, index) => {
      await sleep(index * 40); // 25 Hz

      writeData(
        edgsPath,
        `${getTS()}\t${await getVideoEdgeHostname(userLogin)}\t${userLogin}\n`,
      );
    }));
};

if (require.main === module) {
  updateEdges();
}
