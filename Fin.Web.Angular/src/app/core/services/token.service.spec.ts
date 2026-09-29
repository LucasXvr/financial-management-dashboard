import { beforeEach, describe, expect, it } from 'vitest';

import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    service = new TokenService();
  });

  it('accepts a well-formed token that has not expired', () => {
    service.setToken(createToken(Math.floor(Date.now() / 1000) + 60));

    expect(service.hasToken()).toBe(true);
  });

  it('rejects and removes an expired token', () => {
    service.setToken(createToken(Math.floor(Date.now() / 1000) - 60));

    expect(service.hasToken()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('rejects and removes a malformed token', () => {
    service.setToken('not-a-jwt');

    expect(service.hasToken()).toBe(false);
    expect(service.getToken()).toBeNull();
  });
});

function createToken(exp: number): string {
  const header = encodeBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = encodeBase64Url({ exp });
  return `${header}.${payload}.test-signature`;
}

function encodeBase64Url(value: object): string {
  return btoa(JSON.stringify(value))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}
