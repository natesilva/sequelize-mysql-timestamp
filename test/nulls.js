/* global describe, it, before, beforeEach, afterEach */

'use strict';

const fs = require('fs');
const config = require('./config.js');
if (fs.existsSync(`${__dirname}/config.local.js`)) {
  Object.assign(config, require('./config.local.js'));
}
const Sequelize = require('sequelize');
const uuidV4 = require('uuid/v4');
const assert = require('assert');

describe('NULL TIMESTAMPs', () => {
  let sequelize;
  let TIMESTAMP;
  let Model;

  beforeEach(async () => {
    let testConfig = Object.assign({}, config.db, { timezone: '-08:00' });
    sequelize = new Sequelize(testConfig);
    TIMESTAMP = require('../index.js')(sequelize);

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

  it('should handle NULL timestamps', async () => {
    await Model.create({ username: 'janedoe', hire_date: null });
    const jane = await Model.findOne({ where: { username: 'janedoe' } });
    assert.strictEqual(jane.hire_date, null);
  });
});
