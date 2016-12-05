/**
 * Sequelize support for MySQL TIMESTAMP columns.
 * Works with Sequelize 3.x and 4.x pre-release.
 */

'use strict';

const util = require('util');
const BaseTypes = require('sequelize/lib/data-types');
const sequelizeErrors = require('sequelize/lib/errors');
const moment = require('moment-timezone');
const Validator = require('validator');

// internal date validation function
function _validate(value) {
  if (!Validator.isDate(String(value)) || !moment(String(value)).isValid()) {
    return false;
  }
  return true;
}

class TIMESTAMP extends BaseTypes.ABSTRACT {
  constructor(length) {
    super(length);

    const options = typeof length === 'object' && length || { length };
    this.options = options;
    this._length = options.length || '';
  }

  static get key() { return 'TIMESTAMP'; }
  static extend(oldType) { return new TIMESTAMP(oldType.options); }

  get key() { return 'TIMESTAMP'; }

  // MySQL TIMESTAMP data type defaults to NOT NULL, the opposite of other column types.
  // We don’t want the typical TIMESTAMP NOT NULL behavior, so we force NULL (allow NULL).
  toSql() {
    if (this._length) { return `TIMESTAMP(${this._length}) NULL`; }
    return 'TIMESTAMP NULL';
  }

  static validate(value) {
    if (!_validate(value)) {
      const errMessage = util.format('%j is not a valid date', value);
      throw new sequelizeErrors.ValidationError(errMessage);
    }
    return true;
  }

  validate(value) { return TIMESTAMP.validate(value); }

  _stringify(date, options) {
    if (typeof date === 'string' || date instanceof String) {
      if (_validate(date)) { return this._stringify(moment(date), options); }
    }

    if (!moment.isMoment(date) || !date.isValid()) { return 'invalid date'; }

    if (moment.tz.zone(options.timezone)) {
      if (this._length) {
        return date.tz(options.timezone).format('YYYY-MM-DD HH:mm:ss.SSS');
      } else {
        return date.tz(options.timezone).format('YYYY-MM-DD HH:mm:ss');
      }
    }

    // options timezone is not a known moment timezone; treat it as a UTC offset
    date.utc();
    date.utcOffset(options.timezone);

    if (this._length) {
      return date.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else {
      return date.format('YYYY-MM-DD HH:mm:ss');
    }
  }

  stringify(date, options) { return this._stringify(date, options); }

  static parse(value, options) {
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
  }

  parse(value, options) { return TIMESTAMP.parse(value, options); }
}

TIMESTAMP.types = {};
TIMESTAMP.types.mysql = ['TIMESTAMP'];
BaseTypes.mysql.TIMESTAMP = TIMESTAMP;

exports.TIMESTAMP = TIMESTAMP;
