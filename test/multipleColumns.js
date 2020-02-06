/* global describe, it, beforeEach, afterEach */

'use strict';

const fs = require('fs');
const config = require('./config.js');
if (fs.existsSync(`${__dirname}/config.local.js`)) {
  Object.assign(config, require('./config.local.js'));
}
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const tz = require('timezone/loaded');
const assert = require('assert');

describe('multiple TIMESTAMP columns on a table', () => {
  let sequelize;
  let TIMESTAMP;
  let Model;

  beforeEach(async () => {
    sequelize = new Sequelize(config.db);
    TIMESTAMP = require('../index.js')(sequelize);

    Model = sequelize.define(
      'Model',
      {
        username: Sequelize.STRING,
        hire_date: TIMESTAMP,
        last_review: TIMESTAMP,
      },
      {
        tableName: `_test_timestamp_${uuidV4()}`, // unique table name
        timestamps: false,
      }
    );

    await Model.sync({ force: true });
  });

  afterEach(async () => {
    await Model.drop();
    await sequelize.close();
  });

  it('should store and retrieve a date', async () => {
    const expected1 = tz('2016-01-02T03:04:05Z');
    const expected2 = tz('2016-10-09T08:07:06Z');

    await Model.create({
      username: 'janedoe',
      hire_date: expected1,
      last_review: expected2,
    });
    const jane = await Model.findOne({ where: { username: 'janedoe' } });
    assert.strictEqual(jane.hire_date.getTime(), expected1);
    assert.strictEqual(jane.last_review.getTime(), expected2);
  });
});
