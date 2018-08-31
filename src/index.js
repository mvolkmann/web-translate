export {translate} from './translate';

let languageCode;
let translations = {};
let urlPrefix = 'http://localhost:3000/';

export function getDefaultLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const langCountry = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  return langCountry.split('-')[0];
}

export function getJson(urlSuffix) {
  const url = urlPrefix + urlSuffix;
  return fetch(url)
    .then(res => res.json())
    .catch(e => {
      console.error('web-translate getJson error:', e.message, '; url =', url);
      return {};
    });
}

export const getLanguageCode = () => languageCode;

export const getSupportedLanguages = () => getJson('languages.json');

export const haveTranslations = () => Object.keys(translations).length > 0;

export const i18n = key => translations[key] || key;

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
