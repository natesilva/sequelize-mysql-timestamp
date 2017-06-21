/* global describe, it, beforeEach, afterEach */

'use strict';

const fs = require('fs');
const config = require('./config.json');
if (fs.existsSync(`${__dirname}/config.local.json`)) {
  Object.assign(config, require('./config.local.json'));
}
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const moment = require('moment');
const tz = require('timezone/loaded');
const co = require('co');
const should = require('should');                     // eslint-disable-line

describe('TIMESTAMP column with Sequelize timezone as +00:00 and UTC dates', function () {
  const sequelize = new Sequelize(config.db);
  const TIMESTAMP = require('../index.js')(sequelize);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,          // unique table name
    timestamps: false
  });

  const expected = tz('2016-01-02T03:04:05Z');

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected);
  }));
});

describe('TIMESTAMP column with Sequelize timezone as +00:00 and non-UTC TZ', function () {
  const sequelize = new Sequelize(config.db);
  const TIMESTAMP = require('../index.js')(sequelize);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
    timestamps: false
  });

  const expected = tz('2016-01-02T03:04:05+05:45'); // Asia/Kathmandu

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected);
  }));
});

describe('TIMESTAMP column with Sequelize timezone as +08:00 and non-UTC TZ', function () {
  // test uses +08:00 (Australia/Perth)
  let testConfig = {};
  Object.assign(testConfig, config.db, { timezone: '+08:00' });
  const sequelize = new Sequelize(testConfig);
  const TIMESTAMP = require('../index.js')(sequelize);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
    timestamps: false
  });

  const expected = tz('2016-01-02T03:04:05+08:00');

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected);
  }));
});

describe('TIMESTAMP column with Sequelize timezone as -08:00 and non-UTC TZ', function () {
  // test uses -08:00 (America/Los_Angeles)
  let testConfig = {};
  Object.assign(testConfig, config.db, { timezone: '-08:00' });
  const sequelize = new Sequelize(testConfig);
  const TIMESTAMP = require('../index.js')(sequelize);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
    timestamps: false
  });

  const expected = tz('2016-01-02T03:04:05-08:00');

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected.valueOf());
  }));
});

describe('TIMESTAMP column with Sequelize typeValidation set to true', function() {
  let testConfig = {};
  Object.assign(testConfig, config.db, { typeValidation: true });
  const sequelize = new Sequelize(testConfig);
  const TIMESTAMP = require('../index.js')(sequelize);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: TIMESTAMP
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

  it('should accept a valid date string (may warn)', function() {
    return Model.create({username: 'janedoe', hire_date: '2016-01-02T03:04:05Z'})
      .should.be.fulfilled();
  });

  it('should accept a valid Date object', function() {
    const d = new Date('2016-01-02T03:04:05Z');
    return Model.create({username: 'janedoe', hire_date: d}).should.be.fulfilled();
  });

  it('should accept a valid moment object', function() {
    const m = moment('2013-02-08 09:30:26.123+07:00');
    return Model.create({username: 'janedoe', hire_date: m}).should.be.fulfilled();
  });

  it('should reject non-date data', function() {
    return Model.create({username: 'janedoe', hire_date: 'Not a date'})
      .should.be.rejectedWith({name: 'SequelizeValidationError'});
  });
});

describe('TIMESTAMP column with Sequelize named timezone', function () {
  let testConfig = {};
  Object.assign(testConfig, config.db, { timezone: 'Australia/Perth' });
  const sequelize = new Sequelize(testConfig);
  const TIMESTAMP = require('../index.js')(sequelize);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,           // unique table name
    timestamps: false
  });

  // a date from this PC’s local timezone
  const expected = tz(new Date('2016-01-02T03:04:05'));

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected);
  }));
});
