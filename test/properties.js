/* global describe, it */

'use strict';

const mysqlTimestamp = require('../index.js');
const should = require('should');                     // eslint-disable-line

describe('check TIMESTAMP static properties', function() {
  it('should have a key', function() {
    mysqlTimestamp.TIMESTAMP.key.should.equal('TIMESTAMP');
  });
});
