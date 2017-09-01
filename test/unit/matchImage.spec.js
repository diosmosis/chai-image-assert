import * as fs from 'fs-extra';
import * as path from 'path';
import * as chai from 'chai';

const expect = chai.expect;

const rootDir = path.join(__dirname, '..', '..', 'test_resources');

describe('matchImage', function () {
    const louise = fs.readFileSync(path.join(rootDir, 'expected-screenshots', 'louise.png')),
        tina = fs.readFileSync(path.join(rootDir, 'expected-screenshots', 'tina.png')),
        gene = fs.readFileSync(path.join(rootDir, 'expected-screenshots', 'gene.png'));

    beforeEach(function () {
        chai.use(require('../..')(rootDir));
    });

    it("should successfully match an image against itself", function () {
        expect(louise).to.matchImage('louise');

        // make sure there's no diff image
        const diffImage = path.join(rootDir, 'processed-screenshots', 'louise.diff.png');
        expect(fs.pathExistsSync(diffImage)).to.be.false;
    });

    it("should fail to match an image against a completely different image", function () {
        expect(louise).to.not.matchImage('tina');
    });

    it("should fail if the expected image does not exist", function () {
        expect(function () {
            expect(gene).to.matchImage('ken');
        }).to.throw(Error, /expected file at '[^']+' does not exist/);

        const missingPath = path.join(rootDir, 'processed-screenshots', '_missing.list');

        expect(fs.pathExistsSync(missingPath)).to.be.true;
        expect(fs.readFileSync(missingPath).toString()).to.equal('ken\n');
    });

    it("should fail gracefully if the image magick exeuctable is not found", function () {
        chai.use(require('../..')(rootDir, 'garbagecompare'));

        expect(function () {
            expect(louise).to.matchImage('louise');
        }).to.throw(Error, "the 'garbagecompare' command was not found, ('compare' is provided by imagemagick)");
    });

    it("should use a custom name for the processed screenshot if supplied", function () {
      expect(louise).to.matchImage('louise', 'louise.clone');

      const pathToLouiseClone = path.join(rootDir, 'processed-screenshots', 'louise.clone.png');
      const stat = fs.statSync(pathToLouiseClone);

      expect(stat.isFile()).to.be.true;
    });
});
