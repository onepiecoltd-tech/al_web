// One random question from the published exam bank, for a random speaking prompt.
interface GoQuestion { data: { id: string, prompt: string, sample_answer: string } }

export default defineEventHandler(async (event) => {
  const res = await backend<GoQuestion>(event, '/api/v1/exam-bank/random-question')
  return res.data
})
