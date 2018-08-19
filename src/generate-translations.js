#!/usr/bin/env node

import fs from 'fs';
import {setApiKey, setEngine, translate} from './translate';

const {API_KEY, TRANSLATE_ENGINE} = process.env;
if (!API_KEY) {
  throw new Error(
    'The environment variable API_KEY must set for a language translation service.'
  );
}
setApiKey(API_KEY);

if (TRANSLATE_ENGINE) {
  setEngine(TRANSLATE_ENGINE);
}

async function generateTranslations() {
  // Get all the languages to be supported.
  const languages = readJsonFile('public/languages.json');

  // Get all the strings passed to the i18n function
  // in all the source files under the src directory.
  const sourceKeys = getI18nKeys('src');

  // Get all the English translations.
  const english = readJsonFile('public/en.json');

  // For each language to be supported ...
  const promises = Object.values(languages).map(langCode =>
    processLanguage(langCode, english, sourceKeys)
  );

  await Promise.all(promises);
}

async function processLanguage(langCode, english, sourceKeys) {
  // Don't generate translations for English.
  if (langCode === 'en') return;

  const promises = [];

  // Translations in a language-specific override files take precedence.
  const overrides = readJsonFile('public/' + langCode + '-overrides.json');
  const translations = overrides;

  function getTranslation(langCode, key, englishValue) {
    return promises.push(
      translate('en', langCode, englishValue).then(
        translation => (translations[key] = translation)
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
  for (const key of sourceKeys) {
    if (!translations[key]) getTranslation(langCode, key, key);
  }

  try {
    await Promise.all(promises);

    // Write a new translation file for the current language.
    writeJsonFile('public/' + langCode + '.json', translations);
  } catch (e) {
    console.error('processLanguage error:', e);
  }
}

function getI18nKeys(dirPath) {
  const keys = [];

  const sourceFiles = getSourceFiles(dirPath);
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, {encoding: 'utf8'});
    const re = /i18n\((.+)\)/g;
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

const sourceExtensions = ['js', 'jsx', 'ts', 'tsx'];
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

try {
  generateTranslations();
} catch (e) {
  console.error(e);
}
