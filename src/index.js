export {translate} from './translate';

let languageCode;
let translations = {};

export function getDefaultLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const langCountry = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  return langCountry.split('-')[0];
}

export const getJson = url =>
  fetch(url)
    .then(res => res.json())
    .catch(() => ({}));

export const getLanguageCode = () => languageCode;

export const getSupportedLanguages = () => getJson('languages.json');

export const haveTranslations = () => Object.keys(translations).length > 0;

export const i18n = key => translations[key] || key;

export function setLanguage(code) {
  languageCode = code;
  return getJson(code + '.json').then(t => (translations = t));
}

setLanguage(getDefaultLanguage());
