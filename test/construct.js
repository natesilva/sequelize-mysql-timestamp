/* global describe, it */

'use strict';

const TIMESTAMP = require('../index.js')();
const should = require('should');                     // eslint-disable-line

describe('check construction', function() {
  it('should be constructible with new', function() {
    (function() {
        const ts = new TIMESTAMP;
    }).should.not.throw();
  });

  it('should be constructible with new and a length argument', function() {
    (function() {
        const ts = new TIMESTAMP(3);
    }).should.not.throw();
  });

  it('should be constructible with new and an object argument', function() {
    (function() {
        const ts = new TIMESTAMP({length: 3});
    }).should.not.throw();
  });

  it('should be constructible as a function', function() {
    (function() {
        const ts = TIMESTAMP();
    }).should.not.throw();
  });
});
