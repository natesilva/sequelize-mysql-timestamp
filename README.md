# sequelize-mysql-timestamp

`npm install sequelize-mysql-timestamp`

This adds support to Sequelize for MySQL’s `TIMESTAMP` data type. Specifically, it allows you to use `TIMESTAMP` for basic storage of an absolute date/time.

It **does not** support a common use case where `TIMESTAMP` columns are automatically updated to keep track of row creation and update times. If you need that functionality, use the Sequelize `createdAt`/`updatedAt` columns.

## Why use it

MySQL has two data types for dates and times: `TIMESTAMP` and `DATETIME`. There are tradeoffs with either type; see below.

Currently the main reason to use `TIMESTAMP` is to support legacy DB schemas where it was used instead of `DATETIME`.

## Usage

```javascript
const mysqlTimestamp = require('sequelize-mysql-timestamp');

const User = sequelize.define('User', {
  username: Sequelize.STRING,
  hire_date: mysqlTimestamp.TIMESTAMP
});
```

## Differences between `TIMESTAMP` and `DATETIME`

The MySQL `TIMESTAMP` data type stores a [Unix epoch timestamp](https://en.wikipedia.org/wiki/Unix_time). This represents an _absolute_ instant in time, regardless of timezones, which is great for data consistency. On the other hand, a `TIMESTAMP` can only represent values between January 1970 and January 2038, which is a serious limitation for some apps.

By contrast, `DATETIME` is stored without any timezone. It can represent any date/time from 1000-9999 AD, but without a timezone, _there is no way to know what moment a `DATETIME` represents_. For a `DATETIME` column to be meaningful you must decide in advance what timezone to use (hopefully UTC unless your DB designers are nuts). This isn’t stored in the database, it’s just a convention. Make sure all your programmers are aware of this, and that data is always converted to/from the desired timezone. Sequelize does this with its [`timezone`](http://docs.sequelizejs.com/en/latest/api/sequelize/#new-sequelizedatabase-usernamenull-passwordnull-options) option.

### Conclusion

You can choose `TIMESTAMP`, which represents a specific time regardless of local timezone settings, but only a limited range of dates. Or you can choose `DATETIME`, which represents a wide range of dates, but requires all your programmers and applications to consistently convert to/from an agreed-upon timezone.

The SQL standard defines a data type, `TIMESTAMP WITH TIME ZONE`, that supports a wide range of dates, and because it has an explicit timezone, represents a non-ambiguous moment in time. This is widely supported in other database engines: PostgreSQL and Oracle support `TIMESTAMP WITH TIME ZONE`; Microsoft SQL Server has a similar `DATETIMEOFFSET`. Unfortunately MySQL doesn’t have anything like it. `TIMESTAMP` and `DATETIME`, with their respective limitations, are your only options.

## Tests

To run the unit tests, copy `test/config.example.json` to `test/config.json` and enter credentials for a test database. Then run `npm test`.

During the tests, several tables are created. These have names starting with `_test_timestamp_` followed by a UUID, so they will not conflict with existing tables. These tables are `DROP`ped after the tests.

The tests use Sequelize 3.x. To use Sequelize 4.x, you can do `npm uninstall --save-dev sequelize && npm install --save-dev sequelize@unstable mysql2` before running the test. To switch back to Sequelize 3.x, do `npm uninstall --save-dev sequelize && npm install --save-dev sequelize`.
