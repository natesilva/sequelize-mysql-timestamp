/**
 * Sequelize support for MySQL TIMESTAMP columns.
 * Works with Sequelize 3.x and 4.x pre-release.
 */

'use strict';

const util = require('util');
const _ = require('lodash');
const BaseTypes = require('sequelize/lib/data-types');
const sequelizeErrors = require('sequelize/lib/errors');
const moment = require('moment-timezone');
const Validator = require('validator');

/**
 * like util.inherits, but also copies over static properties
 * @private
 */
function inherits(constructor, superConstructor) {
  util.inherits(constructor, superConstructor); // Instance (prototype) methods
  _.extend(constructor, superConstructor); // Static methods
}

// internal date validation function
function _validate(value) {
  if (!Validator.isDate(String(value))) { return false; }
  if (value instanceof Date) { return moment(value).isValid(); }
  if (moment.isMoment(value)) { return moment(value).isValid(); }
  if (!moment(String(value)).isValid()) { return false; }
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
    if (!moment.isMoment(date)) {
      if (date instanceof Date) {
        return this._stringify(moment(date), options);
      }
      if (Number.isInteger(date)) {
        return this._stringify(moment(new Date(date)), options);
      }
      if (_validate(date)) {
        return this._stringify(moment(date), options);
      }
    }

    if (!moment.isMoment(date) || !date.isValid()) { return 'invalid date'; }

    if (moment.tz.zone(options.timezone)) {
      if (this._length) {
        const result = date.tz(options.timezone).format('YYYY-MM-DD HH:mm:ss.SSS');
        return result;
      } else {
        const result = date.tz(options.timezone).format('YYYY-MM-DD HH:mm:ss');
        return result;
      }
    }

    // options timezone is not a known moment timezone; treat it as a UTC offset
    date.utc();
    date.utcOffset(options.timezone);

    if (this._length) {
      const result = date.format('YYYY-MM-DD HH:mm:ss.SSS');
      return result;
    } else {
      const result = date.format('YYYY-MM-DD HH:mm:ss');
      return result;
    }
};

TIMESTAMP.prototype.parse = TIMESTAMP.parse = function(value, options) {
  const strValue = value.string();
  if (strValue === null) { return strValue; }
  if (!_validate(strValue)) { return 'invalid date'; }

  let result;
  if (moment.tz.zone(options.timezone)) {
    // moment knows about the TZ
    result = moment.tz(strValue, options.timezone).toDate();
  } else {
    // options timezone is not known by moment; treat it as a UTC offset
    const dateStr = `${strValue}${options.timezone}`;
    result = new Date(dateStr);
  }

  return result;
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
