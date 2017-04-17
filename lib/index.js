var fs = require('fs');
var path = require('path');
var spawnSync = require('child_process').spawnSync;

/**
 * Returns a chai plugin that adds the `.matchImage` assertion.
 *
 * Usage:
 *
 * var baseFilePath = '...';
 * chai.use(require('chai-image-assert')(baseFilePath));
 *
 */
module.exports = function (basePath, comparisonCommand) {
    comparisonCommand = comparisonCommand || 'compare';

    var expectedScreenshotsPath = path.join(basePath, 'expected-screenshots'),
        processedScreenshotsPath = path.join(basePath, 'processed-screenshots');

    if (!isDirectory(processedScreenshotsPath)) {
        fs.mkdirSync(processedScreenshotsPath);
    }

    return function (chai, utils) {
        chai.Assertion.addMethod('matchImage', matchImage);

        function matchImage(imageName, processedScreenshotName) {
            var imageBuffer = this._obj;

            chai.assert.instanceOf(imageBuffer, Buffer);

            var processedPath = path.join(processedScreenshotsPath, (processedScreenshotName || imageName) + '.png');
            var expectedPath = path.join(expectedScreenshotsPath, imageName + '.png');
            var diffPath = path.join(processedScreenshotsPath, imageName + '.diff.png');

            fs.writeFileSync(processedPath, imageBuffer);

            chai.assert(
                isFile(expectedPath),
                'expected file at \'' + expectedPath + '\' does not exist'
            );

            this.assert(
                compareImages(expectedPath, processedPath, diffPath, comparisonCommand),
                'expected screenshot to match #{act}',
                'expected screenshot to not match #{act}',
                expectedPath,
                processedPath
            );
        }

        function compareImages(expectedPath, processedPath, diffPath, comparisonCommand) {
            var command = comparisonCommand,
                args = [
                    '-metric',
                    'ae',
                    expectedPath,
                    processedPath,
                    diffPath
                ];

            var result = spawnSync(command, args);

            chai.assert(!isCommandNotFound(result),
                        'the \'' + comparisonCommand + '\' command was not found, make sure imagemagick is available on your machine');

            if (result.status !== 0) {
              return false;
            }

            const allOutput = result.stdout.toString() + result.stderr.toString();
            const pixelError = parseInt(allOutput);
            chai.assert(!isNaN(pixelError),
              'the \'' + comparisonCommand + '\' command output could not be parsed, should be' +
              ' an integer, got: ' + allOutput);

            return pixelError === 0;
        }
    };
};

function isDirectory(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (e) {
        return false;
    }
}

function isFile(path) {
    try {
        return fs.statSync(path).isFile();
    } catch (e) {
        return false;
    }
}

function isCommandNotFound(result) {
    return result.status == 127
        || (result.error != null && result.error.code == 'ENOENT');
}
