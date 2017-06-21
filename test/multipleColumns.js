/* global describe, it, beforeEach, afterEach */

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

describe('multiple TIMESTAMP columns on a table', function () {
  const sequelize = new Sequelize(config.db);
  const TIMESTAMP = require('../index.js')(sequelize);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: TIMESTAMP,
    last_review: TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,          // unique table name
    timestamps: false
  });

  const expected1 = tz('2016-01-02T03:04:05Z');
  const expected2 = tz('2016-10-09T08:07:06Z');

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    // return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected1, last_review: expected2});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected1);
    jane.last_review.getTime().should.equal(expected2);
  }));
});
