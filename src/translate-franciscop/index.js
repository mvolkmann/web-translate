// Translates text into different languages.

import engines from './engines';
import language from './language';

// Cache the translations to avoid re-sending requests.
import cache from './cache';

// Main function
function Translate(options = {}) {
  /*
  if (!(this instanceof Translate)) {
    return new Translate(options);
  }
  */

  const defaults = {
    from: 'en',
    to: 'en',
    cache: undefined,
    language,
    engines,
    engine: 'google',
    keys: {}
  };

  const translate = (text, opts = {}) => {
    // Load all of the appropriate options (verbose but fast)
    // Note: not all of those *should* be documented since some are internal only
    if (typeof opts === 'string') opts = {to: opts};
    opts.text = text;
    opts.from = language(opts.from || translate.from);
    opts.to = language(opts.to || translate.to);
    opts.cache = opts.cache || translate.cache;
    opts.engines = opts.engines || {};
    opts.engine = opts.engine || translate.engine;
    opts.id = opts.id || `${opts.from}:${opts.to}:${opts.engine}:${opts.text}`;
    opts.keys = opts.keys || translate.keys || {};
    /* TODO: What is the point of this loop?
    for (const name of translate.keys) {
      opts.keys[name] = opts.keys[name];
    }
    */
    opts.key = opts.key || translate.key || opts.keys[opts.engine];

    // TODO: validation for few of those

    // Use the desired engine
    const engine = opts.engines[opts.engine] || translate.engines[opts.engine];

    // If it is cached return ASAP
    const cached = cache.get(opts.id);
    if (cached) return Promise.resolve(cached);

    // Target is the same as origin, just return the string
    if (opts.to === opts.from) {
      return Promise.resolve(opts.text);
    }

    // Will load only for Node.js and use the native function
    // in browsers and in React Native.
    if (typeof fetch === 'undefined' && navigator.product !== 'ReactNative') {
      // eslint-disable-next-line global-require
      global.fetch = require('node-fetch');
    }

    if (engine.needkey && !opts.key) {
      throw new Error(
        `The engine "${opts.engine}" needs a key, please provide it`
      );
    }

    const fetchOpts = engine.fetch(opts);
    return fetch(...fetchOpts)
      .then(engine.parse)
      .then(translated => cache.put(opts.id, translated, opts.cache));
  };

  for (const key of Object.keys(defaults)) {
    translate[key] =
      typeof options[key] === 'undefined' ? defaults[key] : options[key];
  }
  return translate;
}

// Small hack needed for Webpack/Babel: https://github.com/webpack/webpack/issues/706
const exp = new Translate();
exp.Translate = Translate;
export default exp;
