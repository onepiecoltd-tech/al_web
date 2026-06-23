// Grade a recorded spoken answer via AI. Forwards the multipart upload to Go.
interface GoSpeakingResult {
  data: { band_overall: number, fluency: number, vocabulary: number, grammar: number, pronunciation: number, feedback: string }
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const audio = parts?.find(p => p.name === 'audio' && p.filename)
  const prompt = parts?.find(p => p.name === 'prompt')?.data.toString()
  if (!audio || !prompt)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu bản ghi âm hoặc đề bài.' })

  const fd = new FormData()
  fd.append('audio', new Blob([new Uint8Array(audio.data)], { type: audio.type }), audio.filename)
  fd.append('prompt', prompt)

  const res = await backend<GoSpeakingResult>(event, '/api/v1/speaking/grade', { method: 'POST', body: fd })
  return res.data
})
