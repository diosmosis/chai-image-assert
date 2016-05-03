[![Build Status](https://travis-ci.org/diosmosis/chai-image-assert.svg?branch=master)](https://travis-ci.org/diosmosis/chai-image-assert)

# chai-image-assert

This repo provides a chai assertion to match buffers against image files.

The assert uses ImageMagick's `compare` tool.

## Usage

```
var fs = require('fs');
var path = require('path');
var chai = require('chai');
chai.use(require('chai-image-assert')(__dirname));

describe("my test", function () {
    it("should match", function () {
        var myFile = fs.readFileSync(path.join("path-to-my-file.png"));
        expect(myFile).to.matchImage('name-in-expected');
    });
});
```
