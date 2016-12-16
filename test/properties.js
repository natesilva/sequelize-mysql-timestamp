/* global describe, it */

'use strict';

const TIMESTAMP = require('../index.js')();
const should = require('should');                     // eslint-disable-line

describe('check TIMESTAMP static properties', function() {
  it('should have a key', function() {
    TIMESTAMP.key.should.equal('TIMESTAMP');
  });
});
