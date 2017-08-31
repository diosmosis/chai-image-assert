const path = require('path');
const fs = require('fs-extra');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaRoute = require('koa-route');
const koaBodyParser = require('koa-bodyparser');
const mount = require('koa-mount');

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

  const viewerPath = path.join(__dirname, '..', '..', 'dist', 'viewer');

  const app = new Koa();
  app.use(koaBodyParser());
  app.use(koaStatic(viewerPath));

  app.use(koaRoute.post('/copy', copyFile));
  app.use(koaRoute.get('/comparisons', getComparisonList));
  app.use(koaRoute.get('/files/processed', getFiles(processedFolderName)));
  app.use(koaRoute.get('/files/expected', getFiles(expectedFolderName)));

  app.use(mount('/files/processed', serveScreenshots(processedFolderName)));
  app.use(mount('/files/expected', serveScreenshots(expectedFolderName)));

  return new Promise((resolve, reject) => {
    app.listen(port, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(result);
    });
  });

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

  function getComparisonList(ctx) {
    return fs.readdir(path.join(screenshotDirs, processedFolderName))
      .then(function (files) {
        // TODO: don't know how to tell if a file is matched against an existing expected file.
        ctx.body = files
          .filter(fileName => /\.png$/.test(fileName))
          .filter(fileName => !/\.diff\.png/.test(fileName))
          .map(fileName => path.basename(fileName));
      });
  }

  function getFiles(folderName) {
    return function (ctx) {
      return fs.readdir(path.join(screenshotDirs, folderName))
        .then(list => {
          ctx.body = list;
        });
    };
  }

  function serveScreenshots(folderName) {
    const app = new Koa();
    app.use(koaStatic(path.join(screenshotDirs, folderName)));
    return app;
  }
};
