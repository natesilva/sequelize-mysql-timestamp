/* global describe, it */

'use strict';

const TIMESTAMP = require('../index.js').TIMESTAMP;
const should = require('should');                     // eslint-disable-line
const moment = require('moment-timezone');

describe('TIMESTAMP parsing', function() {
  it('should parse valid dates with a UTC offset timezone', function() {
    const d = new Date('2016-01-02T03:04:05Z');

    const options = { timezone: '+00:00' };
    const value = {string: () => { return moment(d).utc().format('YYYY-MM-DDTHH:mm:ss'); }};

    TIMESTAMP.parse(value, options).getTime().should.equal(d.valueOf());
  });

  it('should parse valid dates with a known timezone', function() {
    const d = new Date('2016-01-02T03:04:05Z');

    const tz = 'America/Chicago';
    const options = { timezone: tz };
    const value = {string: () => { return moment(d).tz(tz).format('YYYY-MM-DDTHH:mm:ss'); }};

    TIMESTAMP.parse(value, options).getTime().should.equal(d.valueOf());
    const ts = new TIMESTAMP;
    ts.parse(value, options).getTime().should.equal(d.valueOf());
  });

  it('should handle invalid dates with a UTC offset timezone', function() {
    const options = { timezone: '+00:00' };
    const value = {string: () => { return '2016-02-31T03:04:05'; }};
    TIMESTAMP.parse(value, options).should.equal('invalid date');
    const ts = new TIMESTAMP;
    ts.parse(value, options).should.equal('invalid date');
  });

  it('should handle invalid dates with a known timezone', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };
    const value = {string: () => { return '2016-02-31T03:04:05'; }};
    TIMESTAMP.parse(value, options).should.equal('invalid date');
    const ts = new TIMESTAMP;
    ts.parse(value, options).should.equal('invalid date');
  });

  it('should not stringify invalid values from the db', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };
    const ts = new TIMESTAMP;
    let value = '2016-02-31T03:04:05';
    ts.stringify(value, options).should.equal('invalid date');
    value = 42;
    ts.stringify(value, options).should.equal('invalid date');
    value = {};
    ts.stringify(value, options).should.equal('invalid date');
    value = 'not a date';
    ts.stringify(value, options).should.equal('invalid date');
  });
});
