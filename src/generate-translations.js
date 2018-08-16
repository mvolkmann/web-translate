import fs from 'fs';
import translate from 'google-translate-api';

function generateTranslations() {
  // Get all the languages to be supported.
  const languages = readJsonFile('public/languages.json');

  // Get all the strings passed to the i18n function
  // in all the .js files under the src directory.
  const jsKeys = getI18nKeys('src');

  // Get all the English translations.
  const english = readJsonFile('public/en.json');

  // For each language to be supported ...
  Object.values(languages).forEach(langCode =>
    processLanguage(langCode, english, jsKeys)
  );
}

async function processLanguage(langCode, english, jsKeys) {
  // Don't generate translations for English.
  if (langCode === 'en') return;

  const promises = [];

  // Translations in a language-specific override files take precedence.
  const overrides = readJsonFile('public/' + langCode + '-overrides.json');
  const translations = overrides;

  function getTranslation(langCode, key, englishValue) {
    return promises.push(
      translate(englishValue, {to: langCode}).then(
        translation => (translations[key] = translation.text)
      )
    );
  }

  // Translate all English values for keys not found
  // in the override file for the current language.
  for (const [key, value] of Object.entries(english)) {
    if (!translations[key]) getTranslation(langCode, key, value);
  }

  // Translate all keys found in calls to
  // the i18n function in JavaScript files that were
  // not found in an overrides file or the English file.
  for (const key of jsKeys) {
    if (!translations[key]) getTranslation(langCode, key, key);
  }

  await Promise.all(promises);

  // Write a new translation file for the current language.
  writeJsonFile('public/' + langCode + '.json', translations);
}

function getI18nKeys(dirPath) {
  const keys = [];

  const jsFiles = getJsFiles(dirPath);
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, {encoding: 'utf8'});
    const re = /i18n\((.+)\)/g;
    let result;
    while ((result = re.exec(content))) {
      const [, key] = result;
      keys.push(removeQuotes(key));
    }
  }

  return keys;
}

function getJsFiles(dirPath) {
  const jsFiles = [];
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const stat = fs.statSync(dirPath + '/' + file);
      const filePath = dirPath + '/' + file;
      if (stat.isDirectory()) {
        const moreJsFiles = getJsFiles(filePath);
        jsFiles.push(...moreJsFiles);
      } else if (file.endsWith('.js')) jsFiles.push(filePath);
    }
    return jsFiles;
  } catch (e) {
    console.error('getJsFiles error:', e);
  }
}

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return JSON.parse(content);
  } catch (e) {
    // If the file doesn't exist, return an empty object.
    if (e.code === 'ENOENT') return {};

    throw e;
  }
}

function removeQuotes(text) {
  const [firstChar] = text;
  if (firstChar === "'" || firstChar === '"') {
    const lastChar = text[text.length - 1];
    if (lastChar === firstChar) return text.slice(1, -1);
  }
  return text;
}

function writeJsonFile(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

generateTranslations();
