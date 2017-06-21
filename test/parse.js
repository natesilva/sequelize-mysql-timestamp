/* global describe, it */

'use strict';

const TIMESTAMP = require('../index.js')();
const should = require('should');                     // eslint-disable-line
const tz = require('timezone/loaded');

describe('TIMESTAMP parsing', function() {
  it('should parse valid dates with a UTC offset timezone', function() {
    const d = new Date('2016-01-02T03:04:05Z');

    const options = { timezone: '+00:00' };
    const value = { string: () => '2016-01-02T03:04:05Z' };
    TIMESTAMP.parse(value, options).getTime().should.equal(d.valueOf());
  });

  it('should parse valid dates with a known timezone', function() {
    const d = new Date('2016-01-02T03:04:05Z');

    const tzName = 'America/Chicago';
    const options = { timezone: tzName };
    const value = { string: () => { return tz(d, tzName, '%Y-%m-%dT%H:%M:%S'); }};

    TIMESTAMP.parse(value, options).getTime().should.equal(d.valueOf());
  });

  it('should stringify Date objects', function() {
    const value = new Date();
    const options = { timezone: '+00:00' };
    const ts = new TIMESTAMP;
    const expected = tz(value, '%Y-%m-%d %H:%M:%S');
    ts.stringify(value, options).should.equal(expected);
  });

  it('should handle epoch integer values', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };
    const ts = new TIMESTAMP;
    let ivalue = 42;
    let dvalue = new Date(ivalue);
    ts.stringify(ivalue, options).should.equal(ts.stringify(dvalue, options));

    ivalue = 1481850549000;
    dvalue = new Date(ivalue);
    dvalue.toISOString().should.equal('2016-12-16T01:09:09.000Z');
    ts.stringify(ivalue, options).should.equal(ts.stringify(dvalue, options));
  });

  it('should handle string dates but warn', function() {
    const value = new Date();
    const options = { timezone: '+00:00' };
    const ts = new TIMESTAMP;
    const expected = tz(value, '%Y-%m-%d %H:%M:%S');
    ts.stringify(tz(value, '%Y-%m-%d %H:%M:%SZ'), options).should.equal(expected);
  });

  it('should reject dates that are out-of-range for MySQL TIMESTAMPs', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };

    // documented range is 1970-01-01 00:00:01 through 2038-01-19 03:14:07 (UTC)
    const values = [
      new Date('1970-01-01T00:00:00Z'),   // 1 second before the beginning of the range
      new Date('2038-01-19 03:14:08Z'),   // 1 second after the end of the range
      new Date(100000000*86400000),       // absolute max JavaScript Date value
      new Date(-100000000*86400000),      // absolute min JavaScript Date value
      '1970-01-01T00:00:00Z',             // too-early date expressed as a string
      '2038-01-19 03:14:08Z'              // too-late date expressed as a string
    ];

    values.forEach(function(d) {
      const v = { string: () => d };
      TIMESTAMP.parse(v, options).should.equal('invalid date');
    });
  });

  it('should accept extreme in-range dates', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };

    // documented range is 1970-01-01 00:00:01 through 2038-01-19 03:14:07 (UTC)
    const values = [
      new Date('1970-01-01T00:00:01Z'),   // min valid date
      new Date('2038-01-19 03:14:07Z'),   // max valid date
      '1970-01-01T00:00:01Z',             // min date expressed as a string
      '2038-01-19 03:14:07Z'              // max date expressed as a string
    ];

    values.forEach(function(d) {
      const v = { string: () => d };
      TIMESTAMP.parse(v, options).getTime().should.equal((new Date(d).getTime()));
    });
  });
});
