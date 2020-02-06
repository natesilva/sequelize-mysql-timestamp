/* global describe, it */

'use strict';

const TIMESTAMP = require('../index.js')();
const assert = require('assert');

describe('check TIMESTAMP static properties', function() {
  it('should have a key', function() {
    assert.strictEqual(TIMESTAMP.key, 'TIMESTAMP');
  });
});
