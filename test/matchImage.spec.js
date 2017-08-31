import * as fs from 'fs';
import * as path from 'path';
import * as chai from 'chai';

const expect = chai.expect;

describe('matchImage', function () {
    const louise = fs.readFileSync(path.join(__dirname, 'expected-screenshots', 'louise.png')),
        tina = fs.readFileSync(path.join(__dirname, 'expected-screenshots', 'tina.png')),
        gene = fs.readFileSync(path.join(__dirname, 'expected-screenshots', 'gene.png'));

    beforeEach(function () {
        chai.use(require('..')(__dirname));
    });

    it("should successfully match an image against itself", function () {
        expect(louise).to.matchImage('louise');
    });

    it("should fail to match an image against a completely different image", function () {
        expect(louise).to.not.matchImage('tina');
    });

    it("should fail if the expected image does not exist", function () {
        expect(function () {
            expect(gene).to.matchImage('ken');
        }).to.throw(Error, /expected file at '[^']+' does not exist/);
    });

    it("should fail gracefully if the image magick exeuctable is not found", function () {
        chai.use(require('..')(__dirname, 'garbagecompare'));

        expect(function () {
            expect(louise).to.matchImage('louise');
        }).to.throw(Error, "the 'garbagecompare' command was not found, ('compare' is provided by imagemagick)");
    });

    it("should use a custom name for the processed screenshot if supplied", function () {
      expect(louise).to.matchImage('louise', 'louise.clone');

      const pathToLouiseClone = path.join(__dirname, 'processed-screenshots', 'louise.clone.png');
      const stat = fs.statSync(pathToLouiseClone);

      expect(stat.isFile()).to.be.true;
    })
});
