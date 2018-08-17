import realTranslate from 'translate';

realTranslate.engine = 'yandex';

export function setApiKey(apiKey) {
  realTranslate.key = apiKey;
}

export function setEngine(engine) {
  realTranslate.engine = engine;
}

/**
 * Translates text from one language to another.
 * `apiKey` is an API key for the Yandex or Google Translate services.
 * `from` and `to` are language codes.
 */
export function translate(from, to, text) {
  realTranslate.from = from;
  return realTranslate(text, {to});
}
