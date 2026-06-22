export interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
  resolve: ((v: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  open: false,
  title: '',
  message: '',
  confirmLabel: 'Xác nhận',
  cancelLabel: 'Hủy',
  danger: false,
  resolve: null,
})

// Global confirm dialog: `if (!await confirm(...)) return` before any destructive
// action. Backed by <LnConfirmDialog/> mounted once in app.vue.
export function useConfirm() {
  function ask(opts: ConfirmOptions) {
    return new Promise<boolean>((resolve) => {
      Object.assign(state, {
        confirmLabel: 'Xác nhận',
        cancelLabel: 'Hủy',
        danger: false,
        ...opts,
        open: true,
        resolve,
      })
    })
  }

  function settle(v: boolean) {
    state.resolve?.(v)
    state.open = false
    state.resolve = null
  }

  return { state: readonly(state), ask, settle }
}
