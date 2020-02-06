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

describe('TIMESTAMP column with fractional timestamps (MySQL 5.6+ only)', () => {
  let sequelize;
  let TIMESTAMP;
  let Model;

  beforeEach(async () => {
    sequelize = new Sequelize(config.db);
    TIMESTAMP = require('../index.js')(sequelize);

    const result = await sequelize.query('SELECT VERSION() AS version', {
      type: sequelize.QueryTypes.SELECT,
    });

    const parts = result[0].version.split('.').map(x => parseInt(x, 10));
    if (parts[0] < 5) {
      // skip because we are running under a version of MySQL < 5.6
      return this.skip();
    }
    if (parts[0] === 5 && parts[1] < 6) {
      // skip because we are running under a version of MySQL < 5.6
      return this.skip();
    }

    Model = sequelize.define(
      'Model',
      {
        username: Sequelize.STRING,
        hire_date: new TIMESTAMP(3), // store (3) decimal places
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
    const expected = tz('2016-01-02T03:04:05.678Z');
    await Model.create({ username: 'janedoe', hire_date: expected });
    const jane = await Model.findOne({ where: { username: 'janedoe' } });
    assert.strictEqual(jane.hire_date.getTime(), expected);
  });
});
