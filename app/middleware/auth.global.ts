// Auth gate: chặn vào app khi chưa đăng nhập, đẩy về /login.
// (trạng thái đăng nhập lấy từ Pinia store + cookie token.)
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()
  const localePath = useLocalePath()

  const loginPath = localePath('/login')
  const isLogin = to.path === loginPath

  if (!auth.authed && !isLogin) {
    return navigateTo(loginPath)
  }
  if (auth.authed && isLogin) {
    return navigateTo(localePath('/'))
  }
})
