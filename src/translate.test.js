import {setApiKey, translate} from './translate';
const {API_KEY} = process.env;

describe('translate', () => {
  beforeEach(() => {
    expect(API_KEY).toBeDefined();
    setApiKey(API_KEY);
  });

  test('translates', async () => {
    const translation = await translate('en', 'es', 'Hello');
    expect(translation).toBe('Hola');
  });
});
