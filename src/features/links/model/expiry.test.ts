import { describe, expect, it } from 'vitest';

import {
  DEFAULT_EXPIRY_TIME,
  getExpiryState,
  splitLocalDateTime,
  startOfLocalDay,
  withDate,
  withTime,
} from './expiry';

describe('expiry', () => {
  it('splits a datetime-local value', () => {
    expect(splitLocalDateTime('2026-10-20T09:30')).toEqual({ date: '2026-10-20', time: '09:30' });
    expect(splitLocalDateTime('')).toEqual({ date: '', time: '' });
  });

  it('defaults the time when a day is picked first', () => {
    expect(withDate('', new Date(2026, 9, 20))).toBe(`2026-10-20T${DEFAULT_EXPIRY_TIME}`);
  });

  it('keeps the time when the day changes', () => {
    expect(withDate('2026-10-20T09:30', new Date(2026, 9, 25))).toBe('2026-10-25T09:30');
  });

  it('falls back to today when a time is typed first', () => {
    expect(withTime('', '08:15', new Date(2026, 9, 17, 14))).toBe('2026-10-17T08:15');
    expect(withTime('2026-10-20T09:30', '08:15', new Date(2026, 9, 17))).toBe('2026-10-20T08:15');
  });

  it('starts a day at local midnight', () => {
    expect(startOfLocalDay(new Date(2026, 9, 17, 14, 5))).toEqual(new Date(2026, 9, 17));
    expect(startOfLocalDay('2026-10-20')).toEqual(new Date(2026, 9, 20));
  });

  it('marks a link expired once its time has passed', () => {
    const now = new Date('2026-10-17T12:00:00Z');
    expect(getExpiryState(null, now)).toEqual({ expiresAt: null, isExpired: false });
    expect(getExpiryState('2026-10-17T12:00:00Z', now).isExpired).toBe(true);
    expect(getExpiryState('2026-10-18T00:00:00Z', now).isExpired).toBe(false);
  });
});
