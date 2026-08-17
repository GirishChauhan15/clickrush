import "dotenv/config";

export const REFRESH_COOKIE = "clickrush_refresh";

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE,
    sameSite: process.env.COOKIE_SAME_SITE,
    path: "/api/auth",
    maxAge: process.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE,
    sameSite: process.env.COOKIE_SAME_SITE,
    path: "/api/auth"
  });
}
