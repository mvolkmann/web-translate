// From https://www.npmjs.com/package/memory-cache (Rollup didn't want to bundle it otherwise)
'use strict';

function Cache() {
  let _cache = Object.create(null);
  let _hitCount = 0;
  let _missCount = 0;
  let _size = 0;
  let _debug = false;

  this.put = (key, value, time, timeoutCallback) => {
    if (_debug) {
      console.log('caching: %s = %j (@%s)', key, value, time);
    }

    if (
      typeof time !== 'undefined' &&
      (typeof time !== 'number' || isNaN(time) || time <= 0)
    ) {
      throw new Error('Cache timeout must be a positive number');
    } else if (
      typeof timeoutCallback !== 'undefined' &&
      typeof timeoutCallback !== 'function'
    ) {
      throw new Error('Cache timeout callback must be a function');
    }

    const oldRecord = _cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
    } else {
      _size++;
    }

    const record = {
      value,
      expire: time + Date.now()
    };

    if (!isNaN(record.expire)) {
      record.timeout = setTimeout(() => {
        _del(key);
        if (timeoutCallback) {
          timeoutCallback(key, value);
        }
      }, time);
    }

    _cache[key] = record;

    return value;
  };

  this.del = key => {
    let canDelete = true;

    const oldRecord = _cache[key];
    if (oldRecord) {
      clearTimeout(oldRecord.timeout);
      if (!isNaN(oldRecord.expire) && oldRecord.expire < Date.now()) {
        canDelete = false;
      }
    } else {
      canDelete = false;
    }

    if (canDelete) {
      _del(key);
    }

    return canDelete;
  };

  function _del(key) {
    _size--;
    delete _cache[key];
  }

  this.clear = () => {
    for (const key of Object.keys(_cache)) {
      clearTimeout(_cache[key].timeout);
    }
    _size = 0;
    _cache = Object.create(null);
    if (_debug) {
      _hitCount = 0;
      _missCount = 0;
    }
  };

  this.get = key => {
    const data = _cache[key];
    if (typeof data !== 'undefined') {
      if (isNaN(data.expire) || data.expire >= Date.now()) {
        if (_debug) _hitCount++;
        return data.value;
      }
      // free some space
      if (_debug) _missCount++;
      _size--;
      delete _cache[key];
    } else if (_debug) {
      _missCount++;
    }
    return null;
  };

  this.size = () => _size;

  this.memsize = () => this.keys().length;

  this.debug = bool => (_debug = bool);

  this.hits = () => _hitCount;

  this.misses = () => _missCount;

  this.keys = () => Object.keys(_cache);

  this.exportJson = () => {
    const plainJsCache = {};

    // Discard the `timeout` property.
    // Note: JSON doesn't support `NaN`, so convert it to `'NaN'`.
    for (const key of Object.keys(_cache)) {
      const record = _cache[key];
      plainJsCache[key] = {
        value: record.value,
        expire: record.expire || 'NaN'
      };
    }

    return JSON.stringify(plainJsCache);
  };

  this.importJson = (jsonToImport, options) => {
    const cacheToImport = JSON.parse(jsonToImport);
    const currTime = Date.now();

    const skipDuplicates = options && options.skipDuplicates;

    for (const key in cacheToImport) {
      if (cacheToImport.hasOwnProperty(key)) {
        if (skipDuplicates) {
          const existingRecord = _cache[key];
          if (existingRecord) {
            if (_debug) {
              console.log("Skipping duplicate imported key '%s'", key);
            }
            continue;
          }
        }

        const record = cacheToImport[key];

        // record.expire could be `'NaN'` if no expiry was set.
        // Try to subtract from it; a string minus a number is `NaN`, which is perfectly fine here.
        let remainingTime = record.expire - currTime;

        if (remainingTime <= 0) {
          // Delete any record that might exist with the same key, since this key is expired.
          this.del(key);
          continue;
        }

        // Remaining time must now be either positive or `NaN`,
        // but `put` will throw an error if we try to give it `NaN`.
        remainingTime = remainingTime > 0 ? remainingTime : undefined;

        this.put(key, record.value, remainingTime);
      }
    }

    return this.size();
  };
}

const exp = new Cache();
exp.Cache = Cache;
export default exp;
