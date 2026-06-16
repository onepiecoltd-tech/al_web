export type ToastTone = 'ok' | 'err' | 'warn' | 'info'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

const toasts = ref<Toast[]>([])
let _id = 0

export function useToast() {
  function push(message: string, tone: ToastTone = 'info', ms = 3500) {
    const id = ++_id
    toasts.value.push({ id, message, tone })
    setTimeout(() => dismiss(id), ms)
  }

  function dismiss(id: number) {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i !== -1) toasts.value.splice(i, 1)
  }

  return {
    toasts: readonly(toasts),
    ok: (msg: string) => push(msg, 'ok'),
    err: (msg: string) => push(msg, 'err', 4500),
    warn: (msg: string) => push(msg, 'warn'),
    info: (msg: string) => push(msg, 'info'),
    dismiss,
  }
}
