<script setup lang="ts">
const emit = defineEmits<{ login: [] }>()
const mode = ref<'login' | 'register'>('login')
const stats: [string, string][] = [['12.4k', 'người học'], ['380k', 'trận đấu'], ['4.8★', 'đánh giá']]
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
      <div class="relative text-xs text-white/50">© 2026 LuyệnNgữ · Nuxt + Go + PostgreSQL</div>
    </div>

    <!-- form -->
    <div class="grid place-items-center p-10">
      <div class="w-[min(380px,100%)]">
        <h2 class="font-display font-bold text-[1.75rem] mb-1">{{ mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản' }}</h2>
        <p class="text-ink-3 font-body text-[0.9375rem] mb-[22px]">{{ mode === 'login' ? 'Đăng nhập để tiếp tục luyện ngữ.' : 'Miễn phí — nâng cấp Pro bất cứ lúc nào.' }}</p>

        <button type="button" class="w-full justify-center mb-3.5 inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper-0 text-ink font-body font-bold px-[26px] py-3.5 text-[0.9rem] cursor-pointer transition-colors hover:bg-paper-2">
          <span class="grid place-items-center w-[18px] h-[18px] rounded-full bg-white border border-line font-extrabold text-xs text-son">G</span>
          Tiếp tục với Google
        </button>
        <div class="flex items-center gap-3 my-3.5">
          <div class="flex-1 h-px bg-line" /><span class="text-ink-3 text-xs">hoặc</span><div class="flex-1 h-px bg-line" />
        </div>

        <div class="flex flex-col gap-3.5">
          <LnField v-if="mode === 'register'" label="Tên hiển thị" placeholder="VD: Minh Anh" />
          <LnField label="Email" placeholder="ban@email.com" model-value="minhanh@email.com" />
          <LnField label="Mật khẩu" type="password" placeholder="••••••••" model-value="password" :hint="mode === 'login' ? undefined : 'Tối thiểu 8 ký tự.'" />
          <LnBtn variant="primary" size="lg" class="w-full" @click="emit('login')">
            {{ mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản' }}
          </LnBtn>
          <LnBtn variant="ghost" size="sm" icon="mail" class="w-full" @click="emit('login')">
            Đăng nhập bằng mã OTP qua email
          </LnBtn>
        </div>

        <p class="text-ink-3 text-xs text-center mt-5">
          {{ mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? ' }}
          <a class="cursor-pointer font-bold text-son" @click="mode = mode === 'login' ? 'register' : 'login'">
            {{ mode === 'login' ? 'Đăng ký' : 'Đăng nhập' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
