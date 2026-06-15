// Clears the auth cookies set by the login route.
export default defineEventHandler((event) => {
  deleteCookie(event, 'auth_token', { path: '/' })
  deleteCookie(event, 'authed', { path: '/' })
  return { ok: true }
})
