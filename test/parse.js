/* global describe, it */

'use strict';

const TIMESTAMP = require('../index.js')();
const tz = require('timezone/loaded');
const assert = require('assert');
const td = require('testdouble');

describe('TIMESTAMP parsing', function() {
  afterEach(() => {
    td.reset();
  });

  it('should parse valid dates with a UTC offset timezone', function() {
    const d = new Date('2016-01-02T03:04:05Z');

    const options = { timezone: '+00:00' };
    const value = { string: () => '2016-01-02T03:04:05Z' };
    assert.strictEqual(TIMESTAMP.parse(value, options).getTime(), d.valueOf());
  });

  it('should parse valid dates with a known timezone', function() {
    const d = new Date('2016-01-02T03:04:05Z');

    const tzName = 'America/Chicago';
    const options = { timezone: tzName };
    const value = {
      string: () => {
        return tz(d, tzName, '%Y-%m-%dT%H:%M:%S');
      },
    };

    assert.strictEqual(TIMESTAMP.parse(value, options).getTime(), d.valueOf());
  });

  it('should stringify Date objects', function() {
    const value = new Date();
    const options = { timezone: '+00:00' };
    const ts = new TIMESTAMP();
    const expected = tz(value, '%Y-%m-%d %H:%M:%S');
    assert.strictEqual(ts.stringify(value, options), expected);
  });

  it('should handle epoch integer values', function() {
    const tz = '+06:00';
    const options = { timezone: tz };
    const ts = new TIMESTAMP();
    let ivalue = 42;
    let dvalue = new Date(ivalue);
    assert.strictEqual(ts.stringify(ivalue, options), ts.stringify(dvalue, options));

    ivalue = 1481850549000;
    dvalue = new Date(ivalue);
    assert.strictEqual(dvalue.toISOString(), '2016-12-16T01:09:09.000Z');
    assert.strictEqual(ts.stringify(ivalue, options), ts.stringify(dvalue, options));
  });

  it('should handle string dates but warn', function() {
    td.replace(console, 'warn');
    const value = new Date();
    const options = { timezone: '+00:00' };
    const ts = new TIMESTAMP();
    const expected = tz(value, '%Y-%m-%d %H:%M:%S');
    assert.strictEqual(ts.stringify(tz(value, '%Y-%m-%d %H:%M:%SZ'), options), expected);
    td.verify(
      console.warn(td.matchers.contains('TIMESTAMP column was set to a string value'))
    );
  });

  it('should reject dates that are out-of-range for MySQL TIMESTAMPs', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };

    // documented range is 1970-01-01 00:00:01 through 2038-01-19 03:14:07 (UTC)
    const values = [
      new Date('1970-01-01T00:00:00Z'), // 1 second before the beginning of the range
      new Date('2038-01-19 03:14:08Z'), // 1 second after the end of the range
      new Date(100000000 * 86400000), // absolute max JavaScript Date value
      new Date(-100000000 * 86400000), // absolute min JavaScript Date value
      '1970-01-01T00:00:00Z', // too-early date expressed as a string
      '2038-01-19 03:14:08Z', // too-late date expressed as a string
    ];

    values.forEach(function(d) {
      const v = { string: () => d };
      assert.strictEqual(TIMESTAMP.parse(v, options), 'invalid date');
    });
  });

  it('should accept extreme in-range dates', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };

    // documented range is 1970-01-01 00:00:01 through 2038-01-19 03:14:07 (UTC)
    const values = [
      new Date('1970-01-01T00:00:01Z'), // min valid date
      new Date('2038-01-19 03:14:07Z'), // max valid date
      '1970-01-01T00:00:01Z', // min date expressed as a string
      '2038-01-19 03:14:07Z', // max date expressed as a string
    ];

    values.forEach(function(d) {
      const v = { string: () => d };
      assert.strictEqual(TIMESTAMP.parse(v, options).getTime(), new Date(d).getTime());
    });
  });
});
