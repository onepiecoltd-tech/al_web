import { useLnApp } from '~/composables/useLnData'

// Mock auth gate: chặn vào app khi chưa đăng nhập, đẩy về /login.
// (state là mock cấp module — sẽ thay bằng Pinia + cookie khi nối backend.)
export default defineNuxtRouteMiddleware((to) => {
  const { authed } = useLnApp()
  const localePath = useLocalePath()

  const loginPath = localePath('/login')
  const isLogin = to.path === loginPath

  if (!authed.value && !isLogin) {
    return navigateTo(loginPath)
  }
  if (authed.value && isLogin) {
    return navigateTo(localePath('/'))
  }
})
