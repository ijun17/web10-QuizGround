import { generateUniquePin } from './utils';

describe('Utils Test', () => {
  describe('generateUniquePin test', () => {
    it('generateUniquePin 함수는 6자리 PIN 생성 성공', async () => {
      const pin = generateUniquePin(new Map());

      expect(pin).toMatch(/^\d{6}$/);
      expect(parseInt(pin)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(pin)).toBeLessThanOrEqual(999999);
    });

    it('유일한 PIN 생성 성공', async () => {
      const rooms = new Map();
      const pin1 = generateUniquePin(rooms);
      const pin2 = generateUniquePin(rooms);
      expect(pin1).not.toBe(pin2);
    });
  });
});
