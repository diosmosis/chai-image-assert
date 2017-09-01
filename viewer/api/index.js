const path = require('path');
const fs = require('fs-extra');
const Koa = require('koa');
const koaStatic = require('koa-static');
const koaRoute = require('koa-route');
const koaBodyParser = require('koa-bodyparser');
const mount = require('koa-mount');
const _ = require('lodash');

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
    const server = app.listen(port, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(server);
    });
  });

  function copyFile(ctx) {
    const name = ctx.request.body.name;
    if (!name) {
      ctx.throw(400, 'The "name" body parameter is required.');
    }

    const fileName = name + '.png';

    const direction = ctx.request.body.direction;
    if (!direction) {
      ctx.throw(400, 'The "direction" body parameter is required.');
    }
    if (direction !== TO_PROCESSED_DIRECTION
      && direction !== TO_EXPECTED_DIRECTION
    ) {
      ctx.throw(400, `Invalid copy direction "${direction}."`);
    }

    const expectedFolder = path.join(screenshotDirs, expectedFolderName);
    if (!fs.pathExistsSync(expectedFolder)) {
      fs.mkdirSync(expectedFolder);
    }

    const processedFolder = path.join(screenshotDirs, processedFolderName);
    if (!fs.pathExistsSync(processedFolder)) {
      fs.mkdirSync(processedFolder);
    }

    const expectedFile = path.join(expectedFolder, fileName);
    const processedFile = path.join(processedFolder, fileName);

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

    fs.copySync(copyFrom, copyTo);

    ctx.status = 204;
  }

  function getComparisonList(ctx) {
    let files;

    const processedDir = path.join(screenshotDirs, processedFolderName);
    const missingFilesPath = path.join(processedDir, '_missing.list');
    const fileStats = {};

    return fs.readdir(processedDir)
      .then(function (theFiles) {
        files = theFiles
          .filter(fileName => /\.diff\.png$/.test(fileName))
          .map(fileName => path.basename(fileName, '.diff.png'));

        if (!fs.pathExistsSync(missingFilesPath)) {
          return '';
        }

        return fs.readFile(missingFilesPath);
      }).then(function (contents) {
        files.push(...contents.toString().split("\n").filter(line => !! line));
        files = _.uniq(files);

        return Promise.all(files.map(fileName => {
          const filePath = path.join(processedDir, fileName + '.png');
          if (!fs.pathExistsSync(filePath)) {
            return null;
          }

          return fs.stat(filePath);
        }));
      }).then(function (fileStatsArray) {
        fileStatsArray.forEach((stat, idx) => {
          fileStats[files[idx]] = stat;
        });

        files.sort((lhs, rhs) => {
          if (!fileStats[lhs]) {
            return 1;
          } else if (!fileStats[rhs]) {
            return -1;
          }

          if (fileStats[lhs].mtime < fileStats[rhs].mtime) {
            return -1;
          }

          if (fileStats[lhs].mtime > fileStats[rhs].mtime) {
            return 1;
          }

          return 0;
        });

        ctx.body = files;
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
