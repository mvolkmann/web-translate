var global = global || window;

export {translate} from './translate';

let languageCode;
let translations = {};
let urlPrefix = '/';

export function addTranslation(key, value) {
  translations[key] = value;
}

export function getDefaultLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const langCountry = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  return langCountry.split('-')[0];
}

export function getJson(urlSuffix) {
  if (!window.fetch) return Promise.resolve({}); // in tests

  const url = urlPrefix + urlSuffix;
  return window
    .fetch(url)
    .then(res => res.json())
    .catch(e => {
      console.error('web-translate getJson error:', e.message, '; url =', url);
      return {};
    });
}

export const getLanguageCode = () => languageCode;

export const getSupportedLanguages = () => getJson('languages.json');

export const haveTranslations = () => Object.keys(translations).length > 0;

export function i18n(key, data) {
  let t = translations[key] || key;
  if (!data) return t;

  // Could use the Lodash template function for this.
  //_.templateSettings.interpolate = /\${(\w+)}/g;
  //const compiled = _.template(t);
  //return compiled(data);

  for (const key of Object.keys(data)) {
    const value = data[key];
    const re = new RegExp('\\$\\{' + key + '\\}', 'g');
    t = t.replace(re, value);
  }
  return t;
}

export function setLanguage(code) {
  languageCode = code;
  return getJson(code + '.json')
    .then(t => (translations = t))
    .catch(e => console.error('web-translate setLanguage error:', e.message));
}

export function setUrlPrefix(up) {
  urlPrefix = up;
}

setLanguage(getDefaultLanguage());
