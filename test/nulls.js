/* global describe, it, before, beforeEach, afterEach */

'use strict';

const fs = require('fs');
const config = require('./config.json');
if (fs.existsSync(`${__dirname}/config.local.json`)) {
  Object.assign(config, require('./config.local.json'));
}
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const co = require('co');
const should = require('should');                     // eslint-disable-line

describe('NULL TIMESTAMPs', function () {
  let testConfig = {};
  Object.assign(testConfig, config.db, { timezone: 'Australia/Perth' });
  const sequelize = new Sequelize(testConfig);
  const TIMESTAMP = require('../index.js')(sequelize);
  let Model;

  before(co.wrap(function* () {
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

  it('should handle NULL timestamps', co.wrap(function* () {
    yield Model.create({username: 'janedoe', hire_date: null});
    const jane = yield Model.findOne({where: {username: 'janedoe'}});
    should.not.exist(jane.hire_date);
  }));
});
