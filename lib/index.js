import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

const MISSING_LIST_FILENAME = '_missing.list';

/**
 * Returns a chai plugin that adds the `.matchImage` assertion.
 *
 * Usage:
 *
 * var baseFilePath = '...';
 * chai.use(require('chai-image-assert')(baseFilePath));
 *
 */
module.exports = function makeChaiImageAssert(basePath, comparisonCommand, options = {}) {
    comparisonCommand = comparisonCommand || 'compare';

    const expectedScreenshotsPath = path.join(basePath, 'expected-screenshots'),
        processedScreenshotsPath = path.join(basePath, 'processed-screenshots'),
        missingListFilename = path.join(processedScreenshotsPath, MISSING_LIST_FILENAME);

    if (!isDirectory(processedScreenshotsPath)) {
        fs.mkdirSync(processedScreenshotsPath);
    }

    if (isFile(missingListFilename)) {
        fs.unlinkSync(missingListFilename);
    }

    return function chaiImageAssert(chai, utils) {
        chai.Assertion.addMethod('matchImage', matchImage);

        function matchImage(imageName, processedScreenshotName) {
            const imageBuffer = this._obj;

            chai.assert.instanceOf(imageBuffer, Buffer);

            const processedPath = path.join(processedScreenshotsPath, (processedScreenshotName || imageName) + '.png');
            const expectedPath = path.join(expectedScreenshotsPath, imageName + '.png');
            const diffPath = path.join(processedScreenshotsPath, (processedScreenshotName || imageName) + '.diff.png');

            fs.writeFileSync(processedPath, imageBuffer);

            if (!isFile(expectedPath)) {
              fs.appendFileSync(missingListFilename, imageName + '\n');
              chai.assert(false, `expected file at '${expectedPath}' does not exist`);
            }

            if (options.manualCompare) {
              return;
            }

            this.assert(
                compareImages(expectedPath, processedPath, diffPath, comparisonCommand),
                'expected screenshot to match #{act}',
                'expected screenshot to not match #{act}',
                expectedPath,
                processedPath
            );
        }

        function compareImages(expectedPath, processedPath, diffPath, comparisonCommand) {
            const command = comparisonCommand,
                args = [
                    '-metric',
                    'ae',
                    expectedPath,
                    processedPath,
                    diffPath
                ];

            const result = spawnSync(command, args);

            chai.assert(!isCommandNotFound(result),
              `the '${comparisonCommand}' command was not found, ('compare' is provided by imagemagick)`);

            if (result.status !== 0) {
              return false;
            }

            const allOutput = result.stdout.toString() + result.stderr.toString();
            const pixelError = parseInt(allOutput);
            chai.assert(!isNaN(pixelError),
              `the '${comparisonCommand}' command output could not be parsed, should be` +
              ` an integer, got: ${allOutput}`);

            const isSame = pixelError === 0;
            if (isSame && isFile(diffPath)) { // remove diff if same
              fs.unlinkSync(diffPath);
            }

            return isSame;
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
