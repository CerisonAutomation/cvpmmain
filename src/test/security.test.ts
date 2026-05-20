import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeObject } from '../lib/utils';

describe('Security Sanitization', () => {
  it('should remove script tags', () => {
    const input = 'Hello <script>alert("xss")</script> world';
    expect(sanitizeInput(input)).toBe('Hello  world');
  });

  it('should remove event handlers', () => {
    const input = '<img src=x onerror="alert(1)">';
    expect(sanitizeInput(input)).toBe('<img src=x>');
  });

  it('should remove javascript: pseudo-protocol', () => {
    const input = '<a href="javascript:alert(1)">click me</a>';
    expect(sanitizeInput(input)).toBe('<a href="">click me</a>');
  });

  it('should deeply sanitize objects', () => {
    const obj = {
      name: 'John <script>bad()</script>',
      meta: {
        note: 'Some <img src=x onload="bad()"> note'
      },
      tags: ['safe', 'unsafe <script></script>']
    };
    const sanitized = sanitizeObject(obj);
    expect(sanitized.name).toBe('John');
    expect(sanitized.meta.note).toBe('Some <img src=x> note');
    expect(sanitized.tags[1]).toBe('unsafe');
  });
});
