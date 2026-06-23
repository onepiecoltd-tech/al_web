// Pronunciation scoring via the Web Speech API: the user reads a target
// phrase aloud, we transcribe it and score how closely the transcript matches
// (Levenshtein similarity). Chrome-only — callers surface the unsupported case.
export function useSpeechScore() {
  const recording = ref(false)
  const heard = ref('')
  const score = ref<number | null>(null)
  const supported = ref(true)
  let recognition: any = null

  function levenshtein(a: string, b: string) {
    const m = a.length
    const n = b.length
    const dp = Array.from({ length: m + 1 }, (_, i) =>
      Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++)
        dp[i]![j] = a[i - 1] === b[j - 1] ? dp[i - 1]![j - 1]! : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!)
    }
    return dp[m]![n]!
  }
  function similarity(a: string, b: string) {
    a = a.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    b = b.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    if (!a || !b)
      return 0
    return Math.round((1 - levenshtein(a, b) / Math.max(a.length, b.length)) * 100)
  }

  // Records one utterance and resolves with the match score against `target`.
  // No-ops if a recording is already in progress (so a double-tap can't start
  // a second SpeechRecognition, which would abort the first).
  function record(target: string): Promise<number> {
    const Impl = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!Impl) {
      supported.value = false
      return Promise.reject(new Error('unsupported'))
    }
    if (recording.value)
      return Promise.resolve(score.value ?? 0)

    return new Promise((resolve, reject) => {
      recognition = new Impl()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      heard.value = ''
      score.value = null
      let aborted = false
      recognition.onresult = (e: any) => {
        const transcript = e.results[0]?.[0]?.transcript ?? ''
        heard.value = transcript
        score.value = similarity(transcript, target)
      }
      recognition.onerror = (e: any) => {
        recording.value = false
        // A manual stop() reports as "aborted" — not a real failure, so just
        // resolve with whatever we captured instead of surfacing an error.
        if (e?.error === 'aborted') {
          aborted = true
          resolve(score.value ?? 0)
          return
        }
        reject(new Error(e?.error || 'speech error'))
      }
      recognition.onend = () => {
        recording.value = false
        if (!aborted)
          resolve(score.value ?? 0)
      }
      recognition.start()
      recording.value = true
    })
  }
  function stop() {
    recognition?.stop()
  }

  return { recording, heard, score, supported, record, stop }
}
