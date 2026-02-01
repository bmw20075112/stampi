import { describe, it, expect } from 'vitest';
import { formatDate } from './dateFormatter';
import type { DateFormat } from './dateFormatter';

describe('formatDate', () => {
  const testDate = new Date('2024-03-15T14:30:45');

  describe('format: YYYY/MM/DD', () => {
    it('should format date as YYYY/MM/DD', () => {
      expect(formatDate(testDate, 'YYYY/MM/DD')).toBe('2024/03/15');
    });
  });

  describe('format: YYYY-MM-DD', () => {
    it('should format date as YYYY-MM-DD', () => {
      expect(formatDate(testDate, 'YYYY-MM-DD')).toBe('2024-03-15');
    });
  });

  describe('format: DD/MM/YYYY', () => {
    it('should format date as DD/MM/YYYY', () => {
      expect(formatDate(testDate, 'DD/MM/YYYY')).toBe('15/03/2024');
    });
  });

  describe('format: MM/DD/YYYY', () => {
    it('should format date as MM/DD/YYYY', () => {
      expect(formatDate(testDate, 'MM/DD/YYYY')).toBe('03/15/2024');
    });
  });

  describe('single digit padding', () => {
    it('should pad single digit months with zero', () => {
      const date = new Date('2024-01-05T10:00:00');
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/05');
    });

    it('should pad single digit days with zero', () => {
      const date = new Date('2024-12-01T10:00:00');
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/12/01');
    });
  });

  describe('invalid date handling', () => {
    it('should return empty string for invalid date', () => {
      expect(formatDate(new Date('invalid'), 'YYYY/MM/DD')).toBe('');
    });

    it('should return empty string for null', () => {
      expect(formatDate(null as unknown as Date, 'YYYY/MM/DD')).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatDate(undefined as unknown as Date, 'YYYY/MM/DD')).toBe('');
    });
  });

  describe('DateFormat type', () => {
    it('should accept all valid format strings', () => {
      const formats: DateFormat[] = ['YYYY/MM/DD', 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'];
      formats.forEach((format) => {
        expect(formatDate(testDate, format)).toBeTruthy();
      });
    });
  });
});
