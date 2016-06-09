var fs = require('fs');
var path = require('path');
var chai = require('chai');
var expect = chai.expect;

describe('matchImage', function () {
    var louise = fs.readFileSync(path.join(__dirname, 'expected-screenshots', 'louise.png')),
        tina = fs.readFileSync(path.join(__dirname, 'expected-screenshots', 'tina.png')),
        gene = fs.readFileSync(path.join(__dirname, 'expected-screenshots', 'gene.png'));

    beforeEach(function () {
        chai.use(require('../lib')(__dirname));
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
        chai.use(require('../lib')(__dirname, 'garbagecompare'));

        expect(function () {
            expect(louise).to.matchImage('louise');
        }).to.throw(Error, "the 'garbagecompare' command was not found, make sure imagemagick is available on your machine");
    });

    it("should use a custom name for the processed screenshot if supplied", function () {
      expect(louise).to.matchImage('louise', 'louise.clone');

      var pathToLouiseClone = path.join(__dirname, 'processed-screenshots', 'louise.clone.png');
      var stat = fs.statSync(pathToLouiseClone);

      expect(stat.isFile()).to.be.true;
    })
});
