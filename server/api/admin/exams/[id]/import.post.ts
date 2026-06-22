// Admin: import questions into an exam via AI extraction from an uploaded PDF/TXT (auth + admin).
// Forwards the multipart upload to the Go API as FormData.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  if (!file)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu tệp đề thi.' })

  const fd = new FormData()
  fd.append('file', new Blob([new Uint8Array(file.data)], { type: file.type }), file.filename)

  const res = await backend<{ data: { imported: number, questions: unknown[] } }>(
    event,
    `/api/v1/admin/exams/${id}/import`,
    { method: 'POST', body: fd },
  )
  return res.data
})
