import fetch from 'node-fetch';
window.fetch = fetch;

import {addTranslation, i18n} from './index';
import {setApiKey} from './translate';
const {API_KEY} = process.env;

describe('index', () => {
  beforeEach(() => {
    expect(API_KEY).toBeDefined();
    setApiKey(API_KEY);
  });

  test('handles placeholders', () => {
    // eslint-disable-next-line no-template-curly-in-string
    addTranslation('name-age', '${name} is ${age} years old.');
    const translation = i18n('name-age', {name: 'Mark', age: 57});
    expect(translation).toBe('Mark is 57 years old.');
  });
});
