import 'babel-polyfill';
export {translate} from './translate';

let languageCode;
const translations = {};

export function getDefaultLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const langCountry = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  return langCountry.split('-')[0];
}

export function getJson(url) {
  /*
  try {
    const result = await fetch(url);
    const obj = await result.json();
    return obj;
  } catch (e) {
    return {};
  }
  */
  return fetch(url)
    .then(res => res.json())
    .catch(() => ({}));
}

export const getLanguageCode = () => languageCode;

export const getSupportedLanguages = () => getJson('languages.json');

export const haveTranslations = () => Object.keys(translations).length > 0;

export const i18n = key => translations[key] || key;

export function setLanguage(code) {
  languageCode = code;
  return getJson(code + '.json');
}

setLanguage(getDefaultLanguage());
