import {isSourceFile, removeQuotes} from './generate-translations';

describe('generate-translations', () => {
  test('isSourceFile', () => {
    expect(isSourceFile('foo.js')).toBe(true);
    expect(isSourceFile('foo.jsx')).toBe(true);
    expect(isSourceFile('foo.ts')).toBe(true);
    expect(isSourceFile('foo.tsx')).toBe(true);
    expect(isSourceFile('foo.vue')).toBe(true);
    expect(isSourceFile('foo.bar.js')).toBe(true);
    expect(isSourceFile('foo.bar')).toBe(false);
    expect(isSourceFile('foo')).toBe(false);
  });

  test('removeQuotes', () => {
    expect(removeQuotes('"foo"')).toBe('foo');
    expect(removeQuotes("'foo'")).toBe('foo');
    expect(removeQuotes("'foo")).toBeUndefined();
    expect(removeQuotes("foo'")).toBeUndefined();
    expect(removeQuotes('"foo')).toBeUndefined();
    expect(removeQuotes('foo"')).toBeUndefined();
  });
});
