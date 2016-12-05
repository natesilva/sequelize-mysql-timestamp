/* global describe, it, before, beforeEach, afterEach */

'use strict';

const config = require('./config.json');
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const mysqlTimestamp = require('../index.js');
const moment = require('moment-timezone');
const co = require('co');
const should = require('should');                     // eslint-disable-line

describe('TIMESTAMP column with fractional timestamps (MySQL 5.6+ only)', function () {
  const sequelize = new Sequelize(config.db);
  let Model;

  before(co.wrap(function* () {
    const result = yield sequelize.query(
      'SELECT VERSION() AS version', { type: sequelize.QueryTypes.SELECT}
    );

    const parts = result[0].version.split('.').map(x => parseInt(x, 10));
    if (parts[0] < 5) { return this.skip(); }
    if (parts[0] === 5 && parts[1] < 6) { return this.skip(); }

    Model = sequelize.define('Model', {
      username: Sequelize.STRING,
      hire_date: new mysqlTimestamp.TIMESTAMP(3)           // store (3) decimal places
    }, {
      tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
      timestamps: false
    });
  }));

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  const expected = moment('2016-01-02T03:04:05.678Z');

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected.valueOf());
  }));

  it('should store and retrieve a date with UTC offset', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected.valueOf());
    jane.hire_date.getTime().should.equal(expected.utc().valueOf());
  }));

  it('should return consistent UTC date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.hire_date).utc().format('YYYY-MM-DD HH:mm:ss.SSS Z')
      .should.equal(expected.format('YYYY-MM-DD HH:mm:ss.SSS Z'));
  }));

  it('should return consistent timezone-specific date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.hire_date).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss.SSS Z')
      .should.equal(expected.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss.SSS Z'));
  }));
});

describe('TIMESTAMP column with fractional timestamps and named timezone (MySQL 5.6+ only)', function () {
  let testConfig = {};
  Object.assign(testConfig, config.db, { timezone: 'Australia/Perth' });
  const sequelize = new Sequelize(testConfig);
  let Model;

  before(co.wrap(function* () {
    const result = yield sequelize.query(
      'SELECT VERSION() AS version', { type: sequelize.QueryTypes.SELECT}
    );

    const parts = result[0].version.split('.').map(x => parseInt(x, 10));
    if (parts[0] < 5) { return this.skip(); }
    if (parts[0] === 5 && parts[1] < 6) { return this.skip(); }

    Model = sequelize.define('Model', {
      username: Sequelize.STRING,
      hire_date: new mysqlTimestamp.TIMESTAMP(3)           // store (3) decimal places
    }, {
      tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
      timestamps: false
    });
  }));

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  const expected = moment('2016-01-02T03:04:05.678').tz('Australia/Perth');

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected.valueOf());
  }));

  it('should store and retrieve a date with UTC offset', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected.valueOf());
    jane.hire_date.getTime().should.equal(expected.utc().valueOf());
  }));

  it('should return consistent UTC date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.hire_date).utc().format('YYYY-MM-DD HH:mm:ss.SSS Z')
      .should.equal(expected.utc().format('YYYY-MM-DD HH:mm:ss.SSS Z'));
  }));

  it('should return consistent timezone-specific date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.hire_date).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss.SSS Z')
      .should.equal(expected.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss.SSS Z'));
  }));
});
