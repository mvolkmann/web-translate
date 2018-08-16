let languageCode;
let translations = {};

export function getDefaultLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const langCountry = navigator.languages
    ? navigator.languages[0]
    : navigator.language;
  return langCountry.split('-')[0];
}

export async function getJson(url) {
  try {
    const result = await fetch(url);
    const obj = await result.json();
    return obj;
  } catch (e) {
    return {};
  }
}

export const getLanguageCode = () => languageCode;

export const getSupportedLanguages = () => getJson('languages.json');

export const haveTranslations = () => Object.keys(translations).length > 0;

export const i18n = key => translations[key] || key;

export async function setLanguage(code) {
  languageCode = code;
  translations = await getJson(code + '.json');
  console.log('web-translate setLanguage: translations =', translations);
}

setLanguage(getDefaultLanguage());
