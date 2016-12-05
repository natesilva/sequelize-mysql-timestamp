/* global describe, it, before, beforeEach, afterEach */

'use strict';

const config = require('./config.json');
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const mysqlTimestamp = require('../index.js');
const moment = require('moment-timezone');
const co = require('co');
const should = require('should');                     // eslint-disable-line

describe('TIMESTAMP column with Sequelize timezone as +00:00 and UTC dates', function () {
  const sequelize = new Sequelize(config.db);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    birthday: mysqlTimestamp.TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,          // unique table name
    timestamps: false
  });

  const expected = moment('2016-01-02T03:04:05Z');

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
  }));

  it('should store and retrieve a date with UTC offset', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
    jane.birthday.getTime().should.equal(expected.utc().valueOf());
  }));

  it('should return consistent UTC date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).utc().format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected.format('YYYY-MM-DD HH:mm:ss Z'));
  }));

  it('should return consistent timezone-specific date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z'));
  }));
});

describe('TIMESTAMP column with Sequelize timezone as +00:00 and non-UTC TZ', function () {
  const sequelize = new Sequelize(config.db);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    birthday: mysqlTimestamp.TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
    timestamps: false
  });

  const expected = moment('2016-01-02T03:04:05+05:45'); // Asia/Kathmandu

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
  }));

  it('should store and retrieve a date with UTC offset', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
    jane.birthday.getTime().should.equal(expected.utc().valueOf());
  }));

  it('should return consistent UTC date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).utc().format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected.format('YYYY-MM-DD HH:mm:ss Z'));
  }));

  it('should return consistent timezone-specific date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z'));
  }));
});

describe('TIMESTAMP column with Sequelize timezone as +08:00 and non-UTC TZ', function () {
  // test uses +08:00 (Australia/Perth)
  let testConfig = {};
  Object.assign(testConfig, config.db, { timezone: '+08:00' });
  const sequelize = new Sequelize(testConfig);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    birthday: mysqlTimestamp.TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
    timestamps: false
  });

  const expected = moment('2016-01-02T03:04:05+08:00');

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
  }));

  it('should store and retrieve a date with UTC offset', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
    jane.birthday.getTime().should.equal(expected.utc().valueOf());
  }));

  it('should return consistent UTC date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).utc().format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected.utc().format('YYYY-MM-DD HH:mm:ss Z'));
  }));

  it('should return consistent timezone-specific date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z'));
  }));
});

describe('TIMESTAMP column with Sequelize typeValidation set to true', function() {
  let testConfig = {};
  Object.assign(testConfig, config.db, { typeValidation: true });
  const sequelize = new Sequelize(testConfig);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    birthday: mysqlTimestamp.TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
    timestamps: false
  });

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should accept a valid date', function() {
    return Model.create({username: 'janedoe', birthday: '2016-01-02T03:04:05Z'})
      .should.be.fulfilled();
  });

  it('should reject a bogus date', function() {
    return Model.create({username: 'janedoe', birthday: '2016-02-31T03:04:05Z'})
      .should.be.rejectedWith({name: 'SequelizeValidationError'});
  });

  it('should reject non-date data', function() {
    return Model.create({username: 'janedoe', birthday: 'Not a date'})
      .should.be.rejectedWith({name: 'SequelizeValidationError'});
  });
});

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
      birthday: new mysqlTimestamp.TIMESTAMP(3)           // store (3) decimal places
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
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
  }));

  it('should store and retrieve a date with UTC offset', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.birthday.getTime().should.equal(expected.valueOf());
    jane.birthday.getTime().should.equal(expected.utc().valueOf());
  }));

  it('should return consistent UTC date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).utc().format('YYYY-MM-DD HH:mm:ss.SSS Z')
      .should.equal(expected.format('YYYY-MM-DD HH:mm:ss.SSS Z'));
  }));

  it('should return consistent timezone-specific date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', birthday: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.birthday).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss.SSS Z')
      .should.equal(expected.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss.SSS Z'));
  }));
});
