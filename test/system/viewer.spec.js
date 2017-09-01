import * as path from 'path';
import * as chai from 'chai';
import { makeDocumentScreenshot } from 'wdio-screenshot';

const { expect } = chai;

chai.use(require('../..')(path.join(__dirname)));

describe('viewer', function () {
  it('should load the comparison list and display the first comparison on load', async () => {
    browser.url('/');

    const screen = new Buffer(await makeDocumentScreenshot(browser), 'base64');
    expect(screen).to.matchImage('loaded');
  });

  it('should switch to the diff view when the "Diff" tab is selected', async () => {
    browser.click('#cv-diff-toggle');

    const screen = new Buffer(await makeDocumentScreenshot(browser), 'base64');
    expect(screen).to.matchImage('diff-view');
  });

  it('should switch to the expected view when the "Expected" tab is selected', async () => {
    browser.click('#cv-expected-toggle');

    const screen = new Buffer(await makeDocumentScreenshot(browser), 'base64');
    expect(screen).to.matchImage('expected-view');
  });

  it('should switch to the processed view when the "Processed" tab is selected', async () => {
    browser.click('#cv-processed-toggle');

    const screen = new Buffer(await makeDocumentScreenshot(browser), 'base64');
    expect(screen).to.matchImage('processed-view');
  });

  it('should switch comparisons when another is selected on the left', async () => {
    browser.click('.comparison-link*=louise');

    const screen = new Buffer(await makeDocumentScreenshot(browser), 'base64');
    expect(screen).to.matchImage('comparison-change');
  });

  it('should copy a file successfully', async () => {
    browser.click('#copy-to-processed');
    browser.pause(1000);
    browser.url('/');
    browser.click('.comparison-link*=louise');

    const screen = new Buffer(await makeDocumentScreenshot(browser), 'base64');
    expect(screen).to.matchImage('copied');
  });
});
