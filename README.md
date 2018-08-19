# web-translate

Creating web applications that display text in
a variety of written languages is a common need.
One might think this is a solved problem and that simple solutions exist.
I have not found any that fit the bill, so I created web-translate.
This is an open source library that can be obtain via npm at
<https://www.npmjs.com/package/web-translate>.

This is an npm package that provides a set of JavaScript functions and
a command that make language translation in web applications very easy!
It is not specific to any framework and should work with
all the popular choices including React, Vue, and Angular.

The translations are performed as a build step,
so no cost for translation services is incurred
during usage of web applications.

## Goals

The goals for this library are:

- Determine required translations by parsing source files
  for calls to a certain function.
- Determine additional required translations by parsing
  a JSON file containing English translations.
- Support selecting between the two most popular
  translation services, Google Cloud Translate API
  and Yandex Translate Service.
- Support build-time translation to avoid incurring
  run-time translation costs for each user session.
- Support easily generating translations
  for new languages to be supported.
- Allow generated translations to be overridden
  by manually creating language-specific JSON files
  that describe the desired translations.
- Support run-time translations for the rare cases
  where dynamically generated text must be translated.

## No Free Lunch

The most highly recommended language translation services are
the Google Cloud Translation API and the Yandex Translate Service.
Both require an API key.

The Google Cloud Translation API requires setup of
a Google Cloud Platform (GCP) project.
It charges $20 (USD) per million characters translated.
Information on obtaining a Google API key can be found at
<https://cloud.google.com/translate/>.

The Yandex Translate Service has free and commercial tiers.
The free tier currently allows translating up to 1,000,000 characters per day,
but not more than 10,000,000 per month.
The commercial tier pricing is documented at
<https://translate.yandex.com/developers/offer/prices>.
Currently it charges $15 (USD) per million characters translated
up to 50 million. The rates go down slowly above that.
Information on obtaining a Yandex API key can be found at
<https://tech.yandex.com/translate/>.

## Setup

To use this package,

1. `npm install web-translate`
2. Set the environment variable `API_KEY` to the API key for the desired service.
3. Set the environment variable `TRANSLATE_ENGINE` to "google" or "yandex".
   When not set, this defaults to "yandex" because that has a free tier.
4. Add the following npm script in the `package.json` file for your application.\
   `"gentran": "generate-translations",`

## Supported Written Languages

Create the file `languages.json` to describe the languages to be supported.
More can easily be added later. For example,

```json
{
  "Chinese": "zh",
  "English": "en",
  "French": "fr",
  "German": "de",
  "Russian": "ru",
  "Spanish": "es"
}
```

It is important to get the language codes (like "en") correct
because those are used to request translations.

This file must be in a directory that is accessible at the domain of the web app.
For example, if your web app is running on `localhost:3000`
then an HTTP GET request to `localhost:3000/language.json`
must return the content of this file.
For a React app created with create-react-app,
placing this file in the `public` directory will achieve this.

## Getting Translations

Use the `i18n` function to get translations.
For example, when the language is Spanish
calling `i18n('Hello')` might return "Hola".
The string passed to the `i18n` function can be
English text or a key used to lookup the translation
in a language-specific JSON file.

Keys are useful for long phrases, sentences, and even paragraphs.
For example, `i18n('greet')` might return
"Welcome to my wonderful web application!".
Translations for keys must be defined in language-specific JSON files.
For example, the file `en.json` could contain the following:

```json
{
  "contact": "For more information, contact Mark Volkmann.",
  "greet": "Welcome to my wonderful web application!"
}
```

## Specifying Translations

Translations of all the text for all supported languages
can be manually entered in language-specific JSON files
like `es.json` (for Spanish) and `fr.json` (for French).
However as we will see next, these files can be generated
using the Google Translate API.

In some cases it may be desirable to use different translations.
Those provided by the translation service can be overridden by
creating a JSON file whose name starts with the language code,
followed by `-override.json`.
For example, the file `es-overrides.json` could contain
the following to change the translation for "Hello"
from "Hola" to "Oh La".

```json
{
  "Hello": "Oh La"
}
```

## Generating Translations

Manually looking up and specifying translations can be very tedious!
Translations files for all the languages to be supported
can be generated by simply running `npm run gentran`.
Here is a description of what this does.

1. Get all the languages to be supported from the file `languages.json`.
2. Get all the literal strings passed to the `i18n` function
   in all the source files under the `src` directory
   where source files are any with an
   extension of "js", "jsx", "ts", or "tsx".
3. Get all the English translations from the file `en.json`.
4. For each language to be supported except English ...
   1. Set `translations` to all the translations found
      in an overrides file for the current language
      (ex. `fr-overrides.json`).
      If none exist then `translations` begins empty.
   2. For each key/value pair in the English translation file `en.json` ...
      - If there is not already a translation for this key,
        get the translation for the value from the selected translation service
        and save it in `translations`.
   3. For each key found in source files ...
      - If there is not already a translation for this key,
        get the translation for the value from the selected translation service
        and save it in `translations`.
   4. Write `translations` to a new translation file for the current language.

If the `i18n` function is passed a variable instead of literal string,
no translations will be provided. This is because tracing the flow
of the code to find all possible values is a very hard problem.
In these cases, manually enter the desired translations in the `en.json` file.
That will enable translations for all the other supported languages
to be generated.

## Allowing User to Select Language

It is easy to allow the user to change the current language.
Here is an example of how this can be done in a React application.
It should be somewhat similar for other frameworks.
I welcome contribution of code for other frameworks
to share here.

```js
import React, {Component} from 'react';
import {getSupportedLanguages, i18n, setLanguage} from 'web-translate';
import './App.css';

class App extends Component {
  state = {languages: {}};

  async componentDidMount() {
    const languages = await getSupportedLanguages();
    this.setState({languages});
  }

  changeLanguage = async event => {
    await setLanguage(event.target.value);
    this.forceUpdate();
  };

  render() {
    const {languages} = this.state;
    const languageNames = Object.keys(languages);

    return (
      <div className="App">
        <div>
          <label>Language:</label>
          <select onChange={this.changeLanguage}>
            {languageNames.map(name => (
              <option key={name} value={languages[name]}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>{i18n('Hello')}</div>
        <div>{i18n('some-key')}</div>
        <div>{i18n('I love strawberry pie!')}</div>
      </div>
    );
  }
}

export default App;
```

With watch and live reload (as supported by create-react-app),
changes to the list of supported languages and their translations
are made available in the running app seconds after they are saved.

Run `npm run gentran` again whenever:

- new languages are added to the list of supported languages
  in `languages.json`
- new translations are added in the English file `en.json`
- a changes is made in a language-specific `-overrides.json` file
- new calls to `i18n` with literal strings are added in any source file,
  or the literal strings passed to existing calls are modified,
  and translations for the new values are not already present
  in all the language `.json` files

## Dynamic Translation

Some web apps may need to dynamically generate text that requires translation.
This can be accomplished using the `translate` function.
It takes a "from" language code, at "to" language code,
and the text to be translated.

For example, to translate "I like strawberry pie!"
from English to French,

```js
const text = 'I like strawberry pie!';
const translatedText = await translate('en', 'fr', text);
```

Bear in mind that run-time translation will incur per user session
charges from the selected translation service.
Avoid using this when possible.

## Example App

In our example add, we begin with the following files:

### languages.json

```json
{
  "English": "en",
  "French": "fr",
  "Spanish": "es"
}
```

### en.json

```json
{
  "some-key": "My English key"
}
```

### es.json

```json
{
  "Hello": "Hola"
}
```

## App.json

Inside the render method we have:

```json
<div>{i18n('Hello')}</div>
<div>{i18n('some-key')}</div>
```

Before running `npm run gentran` when the app is rendered
we will see the the languages "English", "French", and "Spanish"
in the language dropdown with "English" selected.
We will also see "Hello" and "My English Key"
as the results of the `i18n` calls.

Selecting "French" from the dropdown
displays "Hello" and "some-key".
This happens because the file `fr.json` does not yet exist.

Selecting "Spanish" from the dropdown
displays "Hola" and "some-key".
We see "Hola" because that is the translation for "Hello"
in the `es.json` file.
We see "some-key" because `es.json` does not yet
provide a translation for that key.

Run `npm run gentran`. This generates the files `es.json` and `fr.json`
which will now contain translations for both "Hello" and "some-key".
Depending on your build process, the app may automatically
re-render in the browser.
When "French" is selected from the dropdown
we see "Bonjour" and "Ma clé anglaise" which are
the French translations for "Hello" and "My English Key".
When "Spanish" is selected we see still "Hola",
but we now see the Spanish translation
for "My English Key" which is "Mi clave en inglés".

Add the following lines to `languages.json`:

```json
"German": "de",
"Russian": "ru"
```

Run `npm run gentran` again.
The language dropdown will now contain "German" and "Russian".
Selecting these languages will display their translations.

Add the following in `App.js`:

```js
<div>{i18n('Where is your pencil?`)}</div>
```

Run `npm run gentran` again.
We will now see that text for English.
Select different languages from the dropdown
to display the translation for this text.

Sometimes the translations provided by Google Translate
will not be ideal for the application.
To override translations, create a language-specific
"-override.json" file.
For example, to display "Oh La" instead of "Hola"
for the Spanish translation of "Hello", create the
file `es-override.json` with the following content:

```json
{
  "Hello": "Oh La"
}
```

Run `npm run gentran` again.
Selecting "Spanish" from the dropdown.
The new translation for "Hello" in Spanish will now be displayed.

## Acknowledgements

web-translate uses the npm package translate from
Francisco Presencia (franciscop on GitHub).
See <https://www.npmjs.com/package/translate>.
Thank you Francisco!

## Summary

web-translate provides the simplest approach to
language translations in web applications that I have seen!
