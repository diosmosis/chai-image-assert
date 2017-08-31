const path = require('path');
const fs = require('fs-extra');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaRoute = require('koa-route');
const koaBodyParser = require('koa-bodyparser');

const TO_PROCESSED_DIRECTION = 'to-processed';
const TO_EXPECTED_DIRECTION = 'to-expected';

module.exports = function (options) {
  const port = options.port || 3000;
  const screenshotDirs = options.screenshotDirs;
  const expectedFolderName = options.expectedFolderName || 'expected-screenshots';
  const processedFolderName = options.processedFolderName || 'processed-screenshots';

  if (!screenshotDirs) {
    throw new Error('The screenshotDirs options is required.');
  }

  const viewerPath = path.join(__dirname, '..', 'dist', 'viewer');

  const app = new Koa();
  app.use(koaBodyParser());
  app.use(koaStatic(viewerPath));
  app.use(koaRoute.post('/copy', copyFile));
  app.use(koaRoute.get('/files/processed', getFiles(processedFolderName));
  app.use(koaRoute.get('/files/processed/:name'), getFile(processedFolderName));
  app.use(koaRoute.get('/files/expected', getFiles(expectedFolderName)))
  app.use(koaRoute.get('/files/expected/:name'), getFile(expectedFolderName));

  function copyFile(ctx) {
    const name = ctx.body.name;
    if (!name) {
      ctx.throw(400, 'The "name" body parameter is required.');
    }

    const direction = ctx.body.direction;
    if (!direction) {
      ctx.throw(400, 'The "direction" body parameter is required.');
    }
    if (direction !== TO_PROCESSED_DIRECTION
      && direction !== TO_EXPECTED_DIRECTION
    ) {
      ctx.throw(400, `Invalid copy direction "${direction}."`);
    }

    const expectedFile = path.join(screenshotDirs, expectedFolderName, name);
    const processedFile = path.join(screenshotDirs, processedFolderName, name);

    let copyFrom;
    let copyTo;
    if (direction === TO_PROCESSED_DIRECTION) {
      copyFrom = expectedFile;
      copyTo = processedFile;
    } else {
      copyFrom = processedFile;
      copyTo = expectedFile;
    }

    if (!fs.pathExistsSync(copyFrom)) {
      ctx.throw(400, `The "${copyFrom}" file does not exist!`);
    }

    fs.linkSync(copyFrom, copyTo);

    ctx.status = 204;
  }

  function getFiles(folderName) {
    return function (ctx) {
      return fs.readdir(path.join(screenshotDirs, folderName))
        .then(list => {
          ctx.body = list;
        });
    };
  }

  function getFile(folderName) {
    return function (ctx) {
      const filePath = path.join(screenshotDirs, folderName, ctx.params.name);
      if (!fs.pathExistsSync(filePath)) {
        throw new Error(`The path "${filePath}" does not exist!`);
      }

      ctx.set('Content-Type', 'image/png'); // assuming pngs
      ctx.body = fs.createReadStream(filePath);
    };
  }
};
