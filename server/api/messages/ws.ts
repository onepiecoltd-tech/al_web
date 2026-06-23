// Realtime direct-message delivery, bridged over the BFF (browser → Nitro →
// Go), never browser → Go directly. See memory: web-api-bff-pattern.
//
// The browser opens a normal same-origin WebSocket to this route (so its
// httpOnly auth_token cookie rides along on the upgrade request, same as
// any other request). For each browser connection we open a second,
// server-to-server WebSocket to the Go API and pipe messages from it
// straight through. The token has to go as a "?token=" query param on that
// upstream hop because the platform WebSocket client has no API for custom
// headers — see middleware.AuthenticateWS on the Go side for why that's safe
// (it's a server-to-server hop; the query string never reaches the browser).
function cookieValue(header: string | null, name: string): string | undefined {
  if (!header)
    return undefined
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name)
      return decodeURIComponent(rest.join('='))
  }
  return undefined
}

export default defineWebSocketHandler({
  open(peer) {
    const token = cookieValue(peer.request?.headers.get('cookie') ?? null, 'auth_token')
    if (!token) {
      peer.close(1008, 'unauthorized')
      return
    }

    const { apiBase } = useRuntimeConfig()
    const upstreamUrl = `${apiBase.replace(/^http/, 'ws')}/api/v1/messages/stream?token=${encodeURIComponent(token)}`
    const upstream = new WebSocket(upstreamUrl)
    peerUpstream.set(peer, upstream)

    upstream.addEventListener('message', (ev) => peer.send(ev.data as string))
    upstream.addEventListener('close', () => peer.close())
    upstream.addEventListener('error', () => peer.close(1011, 'upstream error'))
  },
  close(peer) {
    peerUpstream.get(peer)?.close()
    peerUpstream.delete(peer)
  },
})

// One upstream connection per browser peer.
const peerUpstream = new WeakMap<object, WebSocket>()
