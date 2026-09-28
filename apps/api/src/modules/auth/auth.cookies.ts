import type { Response } from 'express';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const ACCESS_MS = 15 * 60 * 1000;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

function base(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
  };
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  secure: boolean,
) {
  const options = base(secure);
  res.cookie(ACCESS_COOKIE, tokens.accessToken, {
    ...options,
    maxAge: ACCESS_MS,
    path: '/',
  });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
    ...options,
    maxAge: REFRESH_MS,
    path: '/api/v1/auth',
  });
}

export function clearAuthCookies(res: Response, secure: boolean) {
  const options = base(secure);
  res.clearCookie(ACCESS_COOKIE, { ...options, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...options, path: '/api/v1/auth' });
}
