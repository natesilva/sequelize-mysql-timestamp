/**
 * Sequelize support for MySQL TIMESTAMP columns.
 * Works with Sequelize 3.x and 4.x pre-release.
 */

'use strict';

const util = require('util');
const _ = require('lodash');
const BaseTypes = require('sequelize/lib/data-types');
const sequelizeErrors = require('sequelize/lib/errors');
const tz = require('timezone/loaded');

const timezoneOffsetRx = /^(\+|\-)(\d{2})(?::)?(\d{2})$/;

// documented min and max values for MySQL’s TIMESTAMP data type
const MIN_DATE = tz('1970-01-01 00:00:01');
const MAX_DATE = tz('2038-01-19 03:14:07');

/**
 * like util.inherits, but also copies over static properties
 * @private
 */
function inherits(constructor, superConstructor) {
  util.inherits(constructor, superConstructor); // Instance (prototype) methods
  _.assignIn(constructor, superConstructor); // Static methods
}

/**
 * Internal date validation. The value may be an integer (representing an epoch
 * timestamp), an object whose numeric representation is an epoch timestamp (such as a
 * JavaScript Date or a Moment.js object), or a string that can be parsed by the Date()
 * constructor.
 * @param {*} value
 */
function _validate(value) {
  if (!isNaN(Number(value))) {
    // value or Date/Moment that is convertible to number representing an epoch offset
    if (Number(value) < MIN_DATE || Number(value) > MAX_DATE) { return false; }
    return true;
  }

  // parse it as a string
  const d = new Date(String(value));
  if (isNaN(d.getTime())) { return false; }
  if (d.getTime() < MIN_DATE || d.getTime() > MAX_DATE) { return false; }
  return true;
}

function TIMESTAMP(length) {
  if (!(this instanceof TIMESTAMP)) return new TIMESTAMP(length);
  BaseTypes.ABSTRACT.apply(this, arguments);
  const options = typeof length === 'object' && length || { length };
  this.options = options;
  this._length = options.length || '';
}
inherits(TIMESTAMP, BaseTypes.ABSTRACT);

TIMESTAMP.key = TIMESTAMP.prototype.key = 'TIMESTAMP';

TIMESTAMP.prototype.toSql = function toSql() {
    if (this._length) { return `TIMESTAMP(${this._length}) NULL`; }
    return 'TIMESTAMP NULL';
};

TIMESTAMP.prototype.validate = function validate(value) {
  if (!_validate(value)) {
    const errMessage = util.format('%j is not a valid date', value);
    throw new sequelizeErrors.ValidationError(errMessage);
  }
  return true;
};

TIMESTAMP.prototype.$stringify = TIMESTAMP.prototype._stringify = function(date, options) {
    if (!_validate(date)) { return 'invalid date'; }

    // special handling for UTC offset timezones ("+08:00" and similar)
    const utcOffset = timezoneOffsetRx.exec(options.timezone);
    if (utcOffset) {
      const sign = utcOffset[1];
      const hours = parseInt(utcOffset[2], 10);
      const minutes = parseInt(utcOffset[3], 10);
      if (this._length) {
        return tz(date, `${sign}${hours} hours`, `${sign}${minutes} minutes`,
          '%Y-%m-%d %H:%M:%S.%3N');
      } else {
        return tz(date, `${sign}${hours} hours`, `${sign}${minutes} minutes`,
          '%Y-%m-%d %H:%M:%S');
      }
    }

    if (this._length) {
      return tz(date, options.timezone, '%Y-%m-%d %H:%M:%S.%3N');
    } else {
      return tz(date, options.timezone, '%Y-%m-%d %H:%M:%S');
    }
};

TIMESTAMP.prototype.parse = TIMESTAMP.parse = function(value, options) {
  const strValue = value.string();
  if (strValue === null) { return strValue; }
  if (!_validate(strValue)) { return 'invalid date'; }

  // special handling for UTC offset timezones ("+08:00" and similar)
  const utcOffset = timezoneOffsetRx.exec(options.timezone);
  if (utcOffset) {
    let sign = utcOffset[1];
    // flip the sign: strValue is in the offset timezone and we want to get back to UTC
    sign = (sign === '+') ? '-' : '+';
    const hours = parseInt(utcOffset[2], 10);
    const minutes = parseInt(utcOffset[3], 10);
    return new Date(tz(strValue, `${sign}${hours} hours`, `${sign}${minutes} minutes`));
  }

  return new Date(tz(strValue, options.timezone));
};

TIMESTAMP.types = {mysql: ['TIMESTAMP']};

function init(sequelize) {
  if (sequelize) {
    /* istanbul ignore if: only called for Sequelize v4 */
    /* istanbul ignore else: only called for Sequelize v3 */
    if (typeof sequelize.connectionManager._refreshTypeParser === 'function') {
      sequelize.connectionManager._refreshTypeParser(TIMESTAMP);
    } else if (typeof sequelize.connectionManager.$refreshTypeParser === 'function') {
      sequelize.connectionManager.$refreshTypeParser(TIMESTAMP);
    }
  }
  return TIMESTAMP;
}

module.exports = init;
