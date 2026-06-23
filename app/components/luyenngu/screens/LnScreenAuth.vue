<script setup lang="ts">
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string, callback: (res: { credential: string }) => void }) => void
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
        }
      }
    }
  }
}

const emit = defineEmits<{ login: [] }>()
const mode = ref<'login' | 'register'>('login')
const stats: [string, string][] = [['12.4k', 'người học'], ['380k', 'trận đấu'], ['4.8★', 'đánh giá']]

const auth = useAuthStore()
const toast = useToast()
const { data: status } = useStatus()
const canSignup = computed(() => status.value.allow_signup)
const name = ref('')
const email = ref('')
const password = ref('')

// Google Identity Services renders its own button into this container — its
// JS SDK requires a real <button> it owns, can't be triggered from ours.
const googleBtn = ref<HTMLElement>()
async function onGoogleCredential(res: { credential: string }) {
  try {
    await auth.loginWithGoogle(res.credential)
    toast.ok('Đăng nhập thành công!')
    emit('login')
  }
  catch (e) {
    const err = e as { data?: { message?: string } }
    toast.err(err.data?.message ?? 'Đăng nhập Google thất bại.')
  }
}
onMounted(() => {
  const { public: { googleClientId } } = useRuntimeConfig()
  if (!googleClientId || !googleBtn.value)
    return
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.onload = () => {
    if (!window.google || !googleBtn.value)
      return
    window.google.accounts.id.initialize({ client_id: googleClientId, callback: onGoogleCredential })
    window.google.accounts.id.renderButton(googleBtn.value, { type: 'standard', shape: 'pill', width: 380, text: 'continue_with', locale: 'vi' })
  }
  document.head.appendChild(script)
})

function switchMode(m: 'login' | 'register') {
  mode.value = m
  name.value = ''
  email.value = ''
  password.value = ''
  error.value = ''
}
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'register') {
      await auth.register(email.value, name.value, password.value)
      toast.ok('Đăng ký thành công! Chào mừng bạn.')
    }
    else {
      await auth.login(email.value, password.value)
      toast.ok('Đăng nhập thành công!')
    }
    emit('login')
  }
  catch (e) {
    const err = e as { data?: { message?: string } }
    error.value = err.data?.message
      ?? (mode.value === 'register' ? 'Đăng ký thất bại. Vui lòng thử lại.' : 'Đăng nhập thất bại. Vui lòng thử lại.')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen grid grid-cols-2 bg-paper-bg max-[720px]:grid-cols-1">
    <!-- brand panel -->
    <div class="relative overflow-hidden bg-ink text-white p-16 flex flex-col justify-between max-[720px]:hidden">
      <div class="absolute inset-0" style="background: radial-gradient(120% 90% at 0% 0%, rgba(220,74,51,.4), transparent 55%)" />
      <div class="relative flex items-center gap-3">
        <LnSeal :size="46" light />
        <div class="font-display font-extrabold text-[1.4rem]">LuyệnNgữ</div>
      </div>
      <div class="relative">
        <div class="font-display font-extrabold text-[2.6rem] leading-[1.1] tracking-[-0.02em] max-w-[14ch]">
          Luyện thi như một <em class="not-italic text-son-bright italic">cuộc đấu</em>.
        </div>
        <p class="text-white/70 text-[1.0625rem] leading-relaxed mt-4 max-w-[40ch]">
          Tải nguồn đề của bạn, để AI giải &amp; sinh đề, rồi thách đấu bạn bè và người lạ để giữ nhịp mỗi ngày.
        </p>
        <div class="flex gap-6 mt-7">
          <div v-for="[v, k] in stats" :key="k">
            <div class="font-display font-extrabold text-2xl">{{ v }}</div>
            <div class="text-xs text-white/60">{{ k }}</div>
          </div>
        </div>
      </div>
      <div class="relative text-xs text-white/50">© 2026 LuyệnNgữ</div>
    </div>

    <!-- form -->
    <div class="grid place-items-center p-10">
      <div class="w-[min(380px,100%)]">
        <h2 class="font-display font-bold text-[1.75rem] mb-1">{{ mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản' }}</h2>
        <p class="text-ink-3 font-body text-[0.9375rem] mb-[22px]">{{ mode === 'login' ? 'Đăng nhập để tiếp tục luyện ngữ.' : 'Miễn phí — nâng cấp Pro bất cứ lúc nào.' }}</p>

        <div ref="googleBtn" class="w-full mb-3.5 flex justify-center" />
        <div v-if="!useRuntimeConfig().public.googleClientId" class="text-ink-3 text-xs text-center mb-3.5">
          (Đăng nhập Google chưa được cấu hình)
        </div>
        <div class="flex items-center gap-3 my-3.5">
          <div class="flex-1 h-px bg-line" /><span class="text-ink-3 text-xs">hoặc</span><div class="flex-1 h-px bg-line" />
        </div>

        <div class="flex flex-col gap-3.5">
          <LnField v-if="mode === 'register'" v-model="name" label="Tên hiển thị" placeholder="VD: Minh Anh" autocomplete="name" />
          <LnField v-model="email" label="Email" type="email" placeholder="ban@email.com" autocomplete="email" />
          <LnField v-model="password" label="Mật khẩu" type="password" placeholder="••••••••" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" :error="error || undefined" :hint="mode === 'login' ? undefined : 'Tối thiểu 6 ký tự.'" @keyup.enter="submit" />
          <LnBtn variant="primary" size="lg" class="w-full" :disabled="loading" @click="submit">
            {{ loading ? 'Đang xử lý…' : (mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản') }}
          </LnBtn>
          <!-- <LnBtn variant="ghost" size="sm" icon="mail" class="w-full" @click="emit('login')">
            Đăng nhập bằng mã OTP qua email
          </LnBtn> -->
        </div>

        <p v-if="canSignup" class="text-ink-3 text-xs text-center mt-5">
          {{ mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? ' }}
          <a class="cursor-pointer font-bold text-son" @click="switchMode(mode === 'login' ? 'register' : 'login')">
            {{ mode === 'login' ? 'Đăng ký' : 'Đăng nhập' }}
          </a>
        </p>
        <p v-else class="text-ink-3 text-xs text-center mt-5">Đăng ký hiện đang tạm đóng.</p>
      </div>
    </div>
  </div>
</template>
