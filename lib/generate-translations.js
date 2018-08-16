'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var processLanguage = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(langCode, english, jsKeys) {
    var promises, overrides, translations, getTranslation, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref2, _ref3, key, value, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _key;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            getTranslation = function getTranslation(langCode, key, englishValue) {
              return promises.push((0, _googleTranslateApi2.default)(englishValue, { to: langCode }).then(function (translation) {
                return translations[key] = translation.text;
              }));
            };

            if (!(langCode === 'en')) {
              _context.next = 3;
              break;
            }

            return _context.abrupt('return');

          case 3:
            promises = [];

            // Translations in a language-specific override files take precedence.

            overrides = readJsonFile('public/' + langCode + '-overrides.json');
            translations = overrides;


            // Translate all English values for keys not found
            // in the override file for the current language.
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 9;
            for (_iterator = Object.entries(english)[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              _ref2 = _step.value;
              _ref3 = _slicedToArray(_ref2, 2);
              key = _ref3[0];
              value = _ref3[1];

              if (!translations[key]) getTranslation(langCode, key, value);
            }

            // Translate all keys found in calls to
            // the i18n function in JavaScript files that were
            // not found in an overrides file or the English file.
            _context.next = 17;
            break;

          case 13:
            _context.prev = 13;
            _context.t0 = _context['catch'](9);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 17:
            _context.prev = 17;
            _context.prev = 18;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 20:
            _context.prev = 20;

            if (!_didIteratorError) {
              _context.next = 23;
              break;
            }

            throw _iteratorError;

          case 23:
            return _context.finish(20);

          case 24:
            return _context.finish(17);

          case 25:
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 28;
            for (_iterator2 = jsKeys[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _key = _step2.value;

              if (!translations[_key]) getTranslation(langCode, _key, _key);
            }

            _context.next = 36;
            break;

          case 32:
            _context.prev = 32;
            _context.t1 = _context['catch'](28);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 36:
            _context.prev = 36;
            _context.prev = 37;

            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }

          case 39:
            _context.prev = 39;

            if (!_didIteratorError2) {
              _context.next = 42;
              break;
            }

            throw _iteratorError2;

          case 42:
            return _context.finish(39);

          case 43:
            return _context.finish(36);

          case 44:
            _context.next = 46;
            return Promise.all(promises);

          case 46:

            // Write a new translation file for the current language.
            writeJsonFile('public/' + langCode + '.json', translations);

          case 47:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[9, 13, 17, 25], [18,, 20, 24], [28, 32, 36, 44], [37,, 39, 43]]);
  }));

  return function processLanguage(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _googleTranslateApi = require('google-translate-api');

var _googleTranslateApi2 = _interopRequireDefault(_googleTranslateApi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function generateTranslations() {
  // Get all the languages to be supported.
  var languages = readJsonFile('public/languages.json');

  // Get all the strings passed to the i18n function
  // in all the .js files under the src directory.
  var jsKeys = getI18nKeys('src');

  // Get all the English translations.
  var english = readJsonFile('public/en.json');

  // For each language to be supported ...
  Object.values(languages).forEach(function (langCode) {
    return processLanguage(langCode, english, jsKeys);
  });
}

function getI18nKeys(dirPath) {
  var keys = [];

  var jsFiles = getJsFiles(dirPath);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = jsFiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var file = _step3.value;

      var content = _fs2.default.readFileSync(file, { encoding: 'utf8' });
      var re = /i18n\((.+)\)/g;
      var result = void 0;
      while (result = re.exec(content)) {
        var _result = result,
            _result2 = _slicedToArray(_result, 2),
            key = _result2[1];

        keys.push(removeQuotes(key));
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  return keys;
}

function getJsFiles(dirPath) {
  var jsFiles = [];
  try {
    var files = _fs2.default.readdirSync(dirPath);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = files[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var file = _step4.value;

        var stat = _fs2.default.statSync(dirPath + '/' + file);
        var filePath = dirPath + '/' + file;
        if (stat.isDirectory()) {
          var moreJsFiles = getJsFiles(filePath);
          jsFiles.push.apply(jsFiles, _toConsumableArray(moreJsFiles));
        } else if (file.endsWith('.js')) jsFiles.push(filePath);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return jsFiles;
  } catch (e) {
    console.error('getJsFiles error:', e);
  }
}

function readJsonFile(filePath) {
  try {
    var content = _fs2.default.readFileSync(filePath);
    return JSON.parse(content);
  } catch (e) {
    // If the file doesn't exist, return an empty object.
    if (e.code === 'ENOENT') return {};

    throw e;
  }
}

function removeQuotes(text) {
  var _text = _slicedToArray(text, 1),
      firstChar = _text[0];

  if (firstChar === "'" || firstChar === '"') {
    var lastChar = text[text.length - 1];
    if (lastChar === firstChar) return text.slice(1, -1);
  }
  return text;
}

function writeJsonFile(filePath, obj) {
  _fs2.default.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

generateTranslations();