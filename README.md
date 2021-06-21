# web-translate

Creating web applications that display text in
a variety of written languages is a common need.
One might think this is a solved problem and that simple solutions exist.
I have not found any that fit the bill, so I created web-translate.
This is an open source library that can be obtained via npm at
<https://www.npmjs.com/package/web-translate>.

The web-translate library provides a set of JavaScript functions and
a command that make language translation in web applications very easy!
It is not specific to any framework and should work with
all the popular choices including React, Vue, and Angular.

The translations are performed as a build step,
so no cost for translation services is incurred
during web application usage.

This library is English-centric from the
standpoint that it assumes all translations
will be driven from initial text that is English.

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
  run-time translation costs during each user session.
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
The cost is \$20 (USD) per million characters translated.
To enable use of the "Cloud Translation API" and obtain an API Key:

- Browse <https://console.cloud.google.com/>, choose an account, and login.
- Select the project for which you want to enable the Translation API
  from the dropdown near the top.
- Scroll down and click "API Enable APIs and get credentials like keys".
- Click "Enable APIs and Service" at the top.
- Enter "translation" in the search input.
- Click "Cloud Translation API" which is not enabled by default.
- Press the "Enable" button.
- Click "Google Cloud Platform" in the upper-left to return to the project page.
- Scroll down and click "API Enable APIs and get credentials like keys" again.
- Click "Credentials" in the left nav.
- Click the "Create Credentials" dropdown and select "API key".
- Copy this API Key to a secure location.

The Yandex Translate Service used to have a free tier, but no longer does.
The commercial tier pricing is documented at
<https://translate.yandex.com/developers/offer/prices>.
Currently the cost is \$15 (USD) per million characters translated
up to 50 million. The rates go down slowly above that.
Information on obtaining a Yandex API key can be found at
<https://tech.yandex.com/translate/>.

## Setup

To use the web-translate package,

1. `npm install web-translate`
2. Set the environment variable `TRANSLATE_ENGINE` to "google" or "yandex".
   When not set, this defaults to "yandex" because that has a free tier.
3. Set the environment variable `API_KEY` to the API key for the desired service.
4. Add the following npm script in the `package.json` file for your application.\
   `"gentran": "generate-translations",`

## Supported Written Languages

Create the file `languages.json` to describe the languages to be supported.
For example,

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
because those are used to request translations. You can find a
list of valid language codes at
<https://www.wikipedia.org/wiki/List_of_ISO_639-1_codes/>

This file must be in a directory that is accessible at the domain of the web app.
For example, if your web application is running on `localhost:3000`
then an HTTP GET request to `localhost:3000/languages.json`
must return the content of this file.
For a React application created with create-react-app,
placing this file in the `public` directory will achieve this.

## Getting Translations

Use the `i18n` function to get translations.
This can be imported with `import {i18n} from 'web-translate';`
For example, when the language is Spanish then
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
using one of the supported translation services.

In some cases it may be desirable to use different translations.
Those provided by the translation service can be overridden by
creating a JSON file whose name starts with the language code,
followed by `-overrides.json`.
For example, the file `es-overrides.json` could contain
the following to change the translation for "Hello"
from "Hola" to "Oh La".

```json
{
  "Hello": "Oh La"
}
```

After creating or modifying these "overrides" files,
generate translations again as described in the next section.

## Generating Translations

Manually looking up and specifying translations can be very tedious!
Translations files for all the languages to be supported
can be generated by simply running `npm run gentran`.
Here is a description of what this does.

1. Get all the languages to be supported from the file `languages.json`.
2. Get all the literal strings passed to the `i18n` function
   in all the source files under the `src` directory
   where source files are any with an
   extension of "js", "jsx", "svelte", "ts", "tsx", or "vue".
3. Get all the English translations from the file `en.json`.
4. For each language to be supported except English ...
   1. Set `translations` to a map of all the translations found
      in an overrides file for the current language
      (ex. `fr-overrides.json`).
      If none exist then `translations` begins empty.
   2. For each key in the English translation file `en.json` ...
      - If there is not already a translation for this key,
        get the translation for the value from the selected translation service
        and save it in `translations`.
   3. For each key found in source files ...
      - If there is not already a translation for this key,
        get the translation for the value from the selected translation service
        and save it in `translations`.
   4. Write `translations` to a new translation file for the current language.

If you choose to generate the translation files,
and you should, remember not to manually edit them because
they will be overwritten the next time `npm run gentran` is run.

If the `i18n` function is passed a variable instead of literal string,
no translations will be provided. This is because tracing the flow
of the code to find all possible values is a very hard problem.
In these cases, manually enter the desired translations in the `en.json` file.
This will enable translations for all the other supported languages
to be generated.

## Allowing User to Select Language

It is easy to allow the user to change the current language.
Here is an example of how this can be done in a React application.
It should be somewhat similar for other frameworks.
I welcome contribution of code for other frameworks
to share here.

```js
import React, {Component} from 'react';
import {
  getLanguageCode,
  getSupportedLanguages,
  i18n,
  setLanguage
} from 'web-translate';
import './App.css';

class App extends Component {
  state = {languages: {}};

  async componentDidMount() {
    const languageCode = getLanguageCode();
    const languages = await getSupportedLanguages();
    this.setState({languageCode, languages});
  }

  changeLanguage = async event => {
    const languageCode = event.target.value;
    await setLanguage(languageCode);
    this.setState({languageCode});
  };

  render() {
    const {languageCode, languages} = this.state;
    const languageNames = Object.keys(languages);

    return (
      <div className="App">
        <div>
          <label>Language:</label>
          <select onChange={this.changeLanguage} value={languageCode}>
            {languageNames.map(name => (
              <option key={name} value={languages[name]}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div>{i18n('Hello')}</div>
        <div>{i18n('some-key')}</div>
      </div>
    );
  }
}

export default App;
```

With watch and live reload (as supported by create-react-app),
changes to the list of supported languages and their translations are
made available in the running application seconds after they are saved.

Run `npm run gentran` again whenever any of the following occur:

- New languages are added to the list of supported languages
  in `languages.json`.
- New translations are added in the English file `en.json`.
- A change is made in a language-specific `-overrides.json` file.
- New calls to `i18n` with literal strings are added in any source file,
  or the literal strings passed to existing calls are modified,
  and translations for the new values are not already present
  in all the language `.json` files.

## Dynamic Translation

Some web applications may need to dynamically
generate text that requires translation.
This can be accomplished using the `translate` function.
It takes a "from" language code, a "to" language code,
and the text to be translated.

For example, to translate "I like strawberry pie!"
from English to French,

```js
const text = 'I like strawberry pie!';
const translatedText = await translate('en', 'fr', text);
```

This requires ensuring that the `TRANSLATE_ENGINE` and `API_KEY`
environment variables are set in the environment
where the web app is running.

Bear in mind that run-time translation will incur per user session
charges from the selected translation service.
Avoid using this approach when possible.

## Example Application

In our example application, we begin with the following files:

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

## App.js

Inside the `render` method we have:

```jsx
<div>{i18n('Hello')}</div>
<div>{i18n('some-key')}</div>
```

Before running `npm run gentran` when the application is rendered
we see the the languages "English", "French", and "Spanish"
in the language dropdown with "English" selected.
We also see "Hello" and "My English Key"
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
Depending on your build process, the application may automatically
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
<div>{i18n('Where is your pencil?')}</div>
```

Run `npm run gentran` again.
We now see that text for English.
Select other languages from the dropdown
to display the translation for this text.

Sometimes the translations provided by the translation service
will not be ideal for the application.
To override translations, create a language-specific
`-overrides.json` file.
For example, to display "Oh La" instead of "Hola"
for the Spanish translation of "Hello", create the
file `es-overrides.json` with the following content:

```json
{
  "Hello": "Oh La"
}
```

Run `npm run gentran` again.
Select "Spanish" from the dropdown.
The new translation for "Hello" in Spanish will be displayed.

## Placeholders

Translation text can contain placeholders for inserting dynamic text.
For example, `en.json` could contain the following line:

```json
  "greet": "Hello ${name}, today is ${dayOfWeek}.",
```

To use this, pass a second argument to `i18n` that is an object
where the keys are the placeholder names
and the values are the values to be inserted.
For example,

```js
i18n('greet', {name: 'Mark', dayOfWeek: 'Tuesday'});
```

## HTML Tags

Translation text can contain HTML tags that are not translated.
For example, `en.json` could contain the following line:

```json
  "greet": "<i>Please</i> be <b>careful<b>!",
```

## Acknowledgements

web-translate uses code from the npm package "translate" from
Francisco Presencia (franciscop on GitHub).
See <https://www.npmjs.com/package/translate>.
Thank you Francisco!

Thanks to AJ Levinson for details on getting a Google Cloud Platform API key!

## Summary

web-translate provides the simplest approach to
language translations in web applications that I have seen!
Please post suggestions for improvements and any issues at
<https://github.com/mvolkmann/web-translate/issues>.
