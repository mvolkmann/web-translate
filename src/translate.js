import translate2 from './translate-franciscop/index';

translate2.engine = 'yandex';

export function setApiKey(apiKey) {
  translate2.key = apiKey;
}

export function setEngine(engine) {
  translate2.engine = engine;
}

/**
 * Translates text from one language to another.
 * `apiKey` is an API key for the Yandex or Google Translate services.
 * `from` and `to` are language codes.
 */
export function translate(from, to, text) {
  // No need to translate whitespace.
  if (!text.trim()) return text;

  translate2.from = from;
  return translate2(text, {to});
}
