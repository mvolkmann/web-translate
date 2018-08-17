import {setApiKey, translate} from './translate';
const {API_KEY} = process.env;

describe('translate', () => {
  test('works', async () => {
    expect(API_KEY).toBeDefined();
    setApiKey(API_KEY);
    const translation = await translate('en', 'es', 'Hello');
    expect(translation).toBe('Hola');
  });
});
