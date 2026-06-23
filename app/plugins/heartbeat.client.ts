// Presence heartbeat: while the user is authenticated and the tab is visible,
// ping the server every 30s so friends see them as online. The server marks
// "online" as last seen within ~75s, so one missed beat is tolerated.
const HEARTBEAT_MS = 30_000

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  let timer: ReturnType<typeof setInterval> | null = null

  async function beat() {
    if (!auth.authed || document.visibilityState !== 'visible')
      return
    await $fetch('/api/me/heartbeat', { method: 'POST' }).catch(() => {})
  }

  function start() {
    if (timer)
      return
    beat() // immediate, so presence is fresh right after login/load
    timer = setInterval(beat, HEARTBEAT_MS)
  }
  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  watch(() => auth.authed, on => (on ? start() : stop()), { immediate: true })
  // Fire one on tab refocus so returning to the tab refreshes presence
  // without waiting up to 30s for the next interval.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible')
      beat()
  })
})
