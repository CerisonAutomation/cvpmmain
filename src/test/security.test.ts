import { describe, it, expect } from 'vitest';
import { sanitizeInput, sanitizeObject } from '../lib/utils';

describe('Security Sanitization', () => {
  it('should encode script tags as HTML entities', () => {
    const input = 'Hello <script>alert("xss")</script> world';
    expect(sanitizeInput(input)).toBe('Hello &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; world');
  });

  it('should encode event handlers as HTML entities', () => {
    const input = '<img src=x onerror="alert(1)">';
    expect(sanitizeInput(input)).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  });

  it('should encode javascript: pseudo-protocol as HTML entities', () => {
    const input = '<a href="javascript:alert(1)">click me</a>';
    expect(sanitizeInput(input)).toBe('&lt;a href=&quot;javascript:alert(1)&quot;&gt;click me&lt;/a&gt;');
  });

  it('should deeply sanitize objects with HTML entity encoding', () => {
    const obj = {
      name: 'John <script>bad()</script>',
      meta: {
        note: 'Some <img src=x onload="bad()"> note'
      },
      tags: ['safe', 'unsafe <script></script>']
    };
    const sanitized = sanitizeObject(obj);
    expect(sanitized.name).toBe('John &lt;script&gt;bad()&lt;/script&gt;');
    expect(sanitized.meta.note).toBe('Some &lt;img src=x onload=&quot;bad()&quot;&gt; note');
    expect(sanitized.tags[1]).toBe('unsafe &lt;script&gt;&lt;/script&gt;');
  });
});
