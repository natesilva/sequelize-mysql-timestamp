/* global describe, it, before, beforeEach, afterEach */

'use strict';

const fs = require('fs');
const config = require('./config.json');
if (fs.existsSync(`${__dirname}/config.local.json`)) {
  Object.assign(config, require('./config.local.json'));
}
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const tz = require('timezone/loaded');
const co = require('co');
const should = require('should');                     // eslint-disable-line

describe('TIMESTAMP column with fractional timestamps (MySQL 5.6+ only)', function () {
  const sequelize = new Sequelize(config.db);
  const TIMESTAMP = require('../index.js')(sequelize);
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
      hire_date: new TIMESTAMP(3)           // store (3) decimal places
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

  const expected = tz('2016-01-02T03:04:05.678Z');

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected);
  }));
});

describe('TIMESTAMP column with fractional timestamps and named timezone (MySQL 5.6+ only)', function () {
  let testConfig = {};
  Object.assign(testConfig, config.db, { timezone: 'Australia/Perth' });
  const sequelize = new Sequelize(testConfig);
  const TIMESTAMP = require('../index.js')(sequelize);
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
      hire_date: new TIMESTAMP(3)           // store (3) decimal places
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

  // a date from this PC’s local timezone
  const expected = tz(new Date('2016-01-02T03:04:05.678'));

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected);
  }));
});
