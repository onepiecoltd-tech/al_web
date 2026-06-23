// One random word for the pronunciation drill.
interface GoWord { data: { id: string, word: string, phonetic: string } }

export default defineEventHandler(async (event) => {
  const res = await backend<GoWord>(event, '/api/v1/speaking/random-word')
  return res.data
})
