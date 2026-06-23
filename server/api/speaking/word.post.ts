// Get a word for the pronunciation drill by name, inserting it if it's new.
interface GoWord { data: { id: string, word: string, phonetic: string } }

export default defineEventHandler(async (event) => {
  const body = await readBody<{ word?: string }>(event)
  const word = body?.word?.trim()
  if (!word)
    throw createError({ statusCode: 400, message: 'Thiếu từ cần luyện.' })

  const res = await backend<GoWord>(event, '/api/v1/speaking/word', { method: 'POST', body: { word } })
  return res.data
})
