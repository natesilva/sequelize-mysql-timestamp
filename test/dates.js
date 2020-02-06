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
const moment = require('moment');
const td = require('testdouble');

// test fixtures
const fixtures = [
  {
    testDate: tz('2016-01-02T03:04:05Z'),
  },

  {
    testDate: tz('2016-01-02T03:04:05+05:45'), // Asia/Kathmandu
  },

  {
    sequelizeTimezone: '+08:00',
    testDate: tz('2016-01-02T03:04:05+08:00'),
  },

  {
    sequelizeTimezone: '-08:00',
    testDate: tz('2016-01-02T03:04:05-08:00'),
  },
];

// Run this test multiple times, once for each fixture above
fixtures.forEach(fixture => {
  describe('store and retrieve a date with config ' + JSON.stringify(fixture), () => {
    let sequelize;
    let TIMESTAMP;
    let Model;

    beforeEach(async () => {
      const testConfig = Object.assign({}, config.db);
      if (fixture.sequelizeTimezone) {
        testConfig.timezone = fixture.sequelizeTimezone;
      }

      sequelize = new Sequelize(testConfig);
      TIMESTAMP = require('../index.js')(sequelize);

      Model = sequelize.define(
        'Model',
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          username: Sequelize.STRING,
          hire_date: TIMESTAMP,
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

    it('should store and retrieve the date', async () => {
      await Model.create({ username: 'janedoe', hire_date: fixture.testDate });
      const jane = await Model.findOne({ where: { username: 'janedoe' } });
      assert.strictEqual(jane.hire_date.getTime(), fixture.testDate);
    });
  });
});

describe('TIMESTAMP column with Sequelize typeValidation set to true', function() {
  let sequelize;
  let TIMESTAMP;
  let Model;

  beforeEach(async () => {
    td.replace(console, 'warn');

    const testConfig = Object.assign({}, config.db, { typeValidation: true });
    sequelize = new Sequelize(testConfig);
    TIMESTAMP = require('../index.js')(sequelize);

    Model = sequelize.define(
      'Model',
      {
        username: Sequelize.STRING,
        hire_date: TIMESTAMP,
      },
      {
        tableName: `_test_timestamp_${uuidV4()}`, // unique table name
        timestamps: false,
      }
    );

    await Model.sync({ force: true });
  });

  afterEach(async () => {
    td.reset();
    await Model.drop();
    await sequelize.close();
  });

  it('should accept a valid date string (may warn)', async () => {
    await assert.doesNotReject(() =>
      Model.create({
        username: 'janedoe',
        hire_date: '2016-01-02T03:04:05Z',
      })
    );
  });

  it('should accept a valid Date object', async () => {
    const d = new Date('2016-01-02T03:04:05Z');
    await assert.doesNotReject(() =>
      Model.create({
        username: 'janedoe',
        hire_date: d,
      })
    );
  });

  it('should accept a valid moment object', async () => {
    const m = moment('2013-02-08 09:30:26.123+07:00');
    await assert.doesNotReject(() =>
      Model.create({
        username: 'janedoe',
        hire_date: m,
      })
    );
  });

  it('should reject non-date data', async () => {
    await assert.rejects(
      () =>
        Model.create({
          username: 'janedoe',
          hire_date: 'Not a date',
        }),
      /SequelizeValidationError/
    );
  });
});
