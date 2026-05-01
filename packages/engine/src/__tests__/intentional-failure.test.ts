import { describe, it, expect } from '@jest/globals';

// intentional failure for CI practice — delete this file when done
describe('intentional failure', () => {
  it('this test is supposed to fail', () => {
    expect(1).toBe(2);
  });
});
