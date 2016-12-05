/* global describe, it, beforeEach, afterEach */

'use strict';

const fs = require('fs');
const config = require('./config.json');
if (fs.existsSync(`${__dirname}/config.local.json`)) {
  Object.assign(config, require('./config.local.json'));
}
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const mysqlTimestamp = require('../index.js');
const moment = require('moment-timezone');
const co = require('co');
const should = require('should');                     // eslint-disable-line

describe('multiple IMESTAMP columns on a table', function () {
  const sequelize = new Sequelize(config.db);

  const Model = sequelize.define('Model', {
    username: Sequelize.STRING,
    hire_date: mysqlTimestamp.TIMESTAMP,
    last_review: mysqlTimestamp.TIMESTAMP
  }, {
    tableName: `_test_timestamp_${uuidV4()}`,          // unique table name
    timestamps: false
  });

  const expected1 = moment('2016-01-02T03:04:05Z');
  const expected2 = moment('2016-10-09T08:07:06Z');

  beforeEach(function() {
    return Model.sync({force: true});
  });

  afterEach(function() {
    // return Model.drop();
  });

  it('should store and retrieve a date', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected1, last_review: expected2});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected1.valueOf());
    jane.last_review.getTime().should.equal(expected2.valueOf());
  }));

  it('should store and retrieve a date with UTC offset', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected1, last_review: expected2});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    jane.hire_date.getTime().should.equal(expected1.valueOf());
    jane.last_review.getTime().should.equal(expected2.valueOf());
  }));

  it('should return consistent UTC date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected1, last_review: expected2});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.hire_date).utc().format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected1.format('YYYY-MM-DD HH:mm:ss Z'));
    moment(jane.last_review).utc().format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected2.format('YYYY-MM-DD HH:mm:ss Z'));
  }));

  it('should return consistent timezone-specific date text', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: expected1, last_review: expected2});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    moment(jane.hire_date).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected1.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z'));
    moment(jane.last_review).tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z')
      .should.equal(expected2.tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss Z'));
  }));
});
