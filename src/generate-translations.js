#!/usr/bin/env node

import fs from 'fs';
import {setApiKey, setEngine, translate} from './translate';
require('dotenv').config();

// For some web apps, change this to 'public'.`
const PUBLIC_DIR = 'static';

const {API_KEY, TRANSLATE_ENGINE} = process.env;
if (!API_KEY) {
  throw new Error(
    'The environment variable API_KEY must be set ' +
      'to use a language translation service.'
  );
}
setApiKey(API_KEY);

if (TRANSLATE_ENGINE) {
  setEngine(TRANSLATE_ENGINE);
}

function generateTranslations() {
  // Get all the languages to be supported.
  const languages = readJsonFile(`${PUBLIC_DIR}/languages.json`);

  // Get all the English translations.
  const english = readJsonFile(`${PUBLIC_DIR}/en.json`);

  // Get all the strings passed to the i18n function
  // in all the source files under the src directory
  // or a directory specified by a command-line argument.
  console.log(
    'generate-translations.js generateTranslations: process.argv =',
    process.argv
  );
  console.log(
    'generate-translations.js generateTranslations: process.argv[2] =',
    process.argv[2]
  );
  const sourceKeys = getI18nKeys(process.argv[2] || 'src');

  // For each language to be supported ...
  const promises = Object.values(languages).map(langCode =>
    processLanguage(langCode, english, sourceKeys)
  );

  return Promise.all(promises);
}

function processLanguage(langCode, english, sourceKeys) {
  // Don't generate translations for English.
  if (langCode === 'en') return;

  let promises = [];

  // Translations in a language-specific override files take precedence.
  const overrides = readJsonFile(`${PUBLIC_DIR}/${langCode}-overrides.json`);
  const translations = overrides;

  function getTranslation(langCode, key, englishValue) {
    // Match placeholders that look like ${name}
    // and tags that look like <name> or </name>.
    const re = /(?:\$\{\w+\})|(?:<\/?\w+>)/g;
    const pieces = englishValue.split(re);

    // If the English value does not contain any placeholders or HTML tags ...
    if (pieces.length === 1) {
      return promises.push(
        translate('en', langCode, englishValue)
          .then(translation => (translations[key] = translation))
          .catch(e => console.error('ERROR in getTranslation 1:', e))
      );
    }

    // Translate each piece outside the placeholders and HTML tags.
    const piecePromises = pieces.map(piece => translate('en', langCode, piece));
    Promise.all(piecePromises)
      .then(pieceTranslations => {
        // Find all the placeholders and HTML tags.
        const placeholders = englishValue.match(re);

        // Stitch the pieces together.
        let [translation] = pieceTranslations;
        placeholders.forEach((placeholder, index) => {
          translation += placeholder + pieceTranslations[index + 1];
        });
        translations[key] = translation;
      })
      .catch(e => console.error('ERROR in getTranslation 2:', e));
  }

  // Translate all English values for keys not found
  // in the override file for the current language.
  for (const [key, value] of Object.entries(english)) {
    if (!translations[key]) getTranslation(langCode, key, value);
  }

  // Wait for all translations for en.json to complete.
  Promise.all(promises)
    .then(() => {
      promises = [];

      // Translate all keys found in calls to
      // the i18n function in JavaScript files that were
      // not found in an overrides file or the English file.
      for (const key of sourceKeys) {
        if (!translations[key]) getTranslation(langCode, key, key);
      }

      // Wait for all translations for i18n calls to complete.
      Promise.all(promises)
        // Write a new translation file for this language.
        .then(() =>
          writeJsonFile(`${PUBLIC_DIR}/${langCode}.json`, translations)
        )
        .catch(e => console.error('ERROR in getTranslation 3:', e));
    })
    .catch(e => console.error('ERROR in getTranslation 4:', e));
}

function getI18nKeys(dirPath) {
  const keys = [];

  const sourceFiles = getSourceFiles(dirPath);
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, {encoding: 'utf8'});
    // Find a matches for "i18n(" followed by anything but ")"
    // all the way to the next ")".
    const re = /i18n\(([^)]+)\)/g;
    let result;
    while ((result = re.exec(content))) {
      const key = removeQuotes(result[1]);
      if (key) keys.push(key);
    }
  }

  return keys;
}

function getSourceFiles(dirPath) {
  const sourceFiles = [];
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const stat = fs.statSync(dirPath + '/' + file);
      const filePath = dirPath + '/' + file;
      if (stat.isDirectory()) {
        const moreJsFiles = getSourceFiles(filePath);
        sourceFiles.push(...moreJsFiles);
      } else if (isSourceFile(file)) sourceFiles.push(filePath);
    }
    return sourceFiles;
  } catch (e) {
    console.error('getSourceFiles error:', e);
  }
}

const sourceExtensions = ['js', 'jsx', 'svelte', 'ts', 'tsx', 'vue'];
export function isSourceFile(file) {
  const index = file.lastIndexOf('.');
  const extension = file.substring(index + 1);
  return sourceExtensions.includes(extension);
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

export function removeQuotes(text) {
  const [firstChar] = text;
  if (firstChar === "'" || firstChar === '"') {
    const lastChar = text[text.length - 1];
    if (lastChar === firstChar) return text.slice(1, -1);
  }
  // If the string is not surrounded by matching quotes,
  // nothing is returned.
}

function writeJsonFile(filePath, obj) {
  const sortedKeys = Object.keys(obj).sort();
  fs.writeFileSync(filePath, JSON.stringify(obj, sortedKeys, 2));
}

generateTranslations();
