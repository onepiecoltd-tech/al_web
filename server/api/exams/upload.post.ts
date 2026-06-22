// Upload an exam file → Go extracts questions via AI and creates a user-owned exam.
// Forwards the multipart upload to the Go API as FormData.
export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.filename)
  if (!file)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu tệp đề thi.' })

  const fd = new FormData()
  fd.append('file', new Blob([new Uint8Array(file.data)], { type: file.type }), file.filename)
  const name = parts?.find(p => p.name === 'name')?.data.toString()
  if (name)
    fd.append('name', name)

  return backend<{ data: { exam: unknown, imported: number } }>(
    event,
    '/api/v1/exams/upload',
    { method: 'POST', body: fd },
  ).then(r => r.data)
})
