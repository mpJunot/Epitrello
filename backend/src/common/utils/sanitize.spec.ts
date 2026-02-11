import { escapeSingleQuotes } from './sanitize';

describe('sanitize', () => {
  describe('escapeSingleQuotes', () => {
    it('should double single quotes (SQL-style)', () => {
      expect(escapeSingleQuotes("it's")).toBe("it''s");
      expect(escapeSingleQuotes("'quoted'")).toBe("''quoted''");
    });

    it('should return empty string when input is empty', () => {
      expect(escapeSingleQuotes('')).toBe('');
    });

    it('should replace all occurrences, not just the first', () => {
      expect(escapeSingleQuotes("a'b'c")).toBe("a''b''c");
    });

    it('should leave string unchanged when no single quote', () => {
      expect(escapeSingleQuotes('hello')).toBe('hello');
    });
  });
});
