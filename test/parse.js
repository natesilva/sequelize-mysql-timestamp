/* global describe, it */

'use strict';

const TIMESTAMP = require('../index.js')();
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
  });

  it('should stringify Date objects', function() {
    const value = new Date();
    const options = { timezone: '+00:00' };
    const ts = new TIMESTAMP;
    const expected = moment(value).utc().format('YYYY-MM-DD HH:mm:ss');
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

  it('should not stringify invalid values from the db', function() {
    const tz = 'America/Chicago';
    const options = { timezone: tz };
    const ts = new TIMESTAMP;
    let value = '2016-02-31T03:04:05';
    ts.stringify(value, options).should.equal('invalid date');
    value = {};
    ts.stringify(value, options).should.equal('invalid date');
    value = 'not a date';
    ts.stringify(value, options).should.equal('invalid date');
  });
});
