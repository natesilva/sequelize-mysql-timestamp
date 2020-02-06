/* global describe, it */

'use strict';

const assert = require('assert');

describe('check construction', () => {
  let TIMESTAMP;

  beforeEach(() => {
    TIMESTAMP = require('../index.js')();
  });

  it('should be constructible with new', () => {
    assert.doesNotThrow(() => {
      const ts = new TIMESTAMP();
    });
  });

  it('should be constructible with new and a length argument', () => {
    assert.doesNotThrow(() => {
      const ts = new TIMESTAMP(3);
    });
  });

  it('should be constructible with new and an object argument', () => {
    assert.doesNotThrow(() => {
      const ts = new TIMESTAMP({ length: 3 });
    });
  });

  it('should be constructible as a function', () => {
    assert.doesNotThrow(() => {
      const ts = TIMESTAMP();
    });
  });
});
