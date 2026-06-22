<script setup lang="ts">
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { cn } from '~/lib/utils'

const props = defineProps<{ label?: string, placeholder?: string }>()
const model = defineModel<string>({ default: '' })

const editor = useEditor({
  content: model.value,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false, autolink: true }),
    Placeholder.configure({ placeholder: props.placeholder ?? '' }),
  ],
  editorProps: {
    attributes: { class: 'ln-rich-content' },
  },
  onUpdate: ({ editor: e }) => {
    model.value = e.isEmpty ? '' : e.getHTML()
  },
})

// keep the editor in sync if the model is replaced from outside (e.g. opening a different post)
watch(model, (v) => {
  if (editor.value && v !== editor.value.getHTML())
    editor.value.commands.setContent(v ?? '', { emitUpdate: false })
})

onBeforeUnmount(() => editor.value?.destroy())

const tools: { label: string, icon: string, run: () => void, active: () => boolean }[] = [
  { label: 'Đậm', icon: 'bold', run: () => editor.value?.chain().focus().toggleBold().run(), active: () => !!editor.value?.isActive('bold') },
  { label: 'Nghiêng', icon: 'italic', run: () => editor.value?.chain().focus().toggleItalic().run(), active: () => !!editor.value?.isActive('italic') },
  { label: 'Tiêu đề', icon: 'heading-2', run: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(), active: () => !!editor.value?.isActive('heading', { level: 2 }) },
  { label: 'Danh sách', icon: 'list', run: () => editor.value?.chain().focus().toggleBulletList().run(), active: () => !!editor.value?.isActive('bulletList') },
  { label: 'Danh sách số', icon: 'list-ordered', run: () => editor.value?.chain().focus().toggleOrderedList().run(), active: () => !!editor.value?.isActive('orderedList') },
  { label: 'Trích dẫn', icon: 'quote', run: () => editor.value?.chain().focus().toggleBlockquote().run(), active: () => !!editor.value?.isActive('blockquote') },
]

function toggleLink() {
  const prev = editor.value?.getAttributes('link').href as string | undefined
  const url = window.prompt('Nhập URL liên kết:', prev ?? 'https://')
  if (url === null)
    return
  if (url === '') {
    editor.value?.chain().focus().unsetLink().run()
    return
  }
  editor.value?.chain().focus().setLink({ href: url }).run()
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="props.label" class="font-body text-[0.8125rem] font-semibold text-ink-2">{{ props.label }}</label>
    <div class="rounded-md-ln border border-line-strong bg-paper-0 overflow-hidden focus-within:border-son">
      <div class="flex items-center gap-0.5 px-1.5 py-1 border-b border-line bg-paper-2">
        <button
          v-for="t in tools"
          :key="t.label"
          type="button"
          :title="t.label"
          :class="cn('grid place-items-center w-7 h-7 rounded-md-ln cursor-pointer hover:bg-paper-1', t.active() && 'bg-son-soft text-son-deep')"
          @click="t.run"
        >
          <LnIcon :name="t.icon" :size="15" />
        </button>
        <button type="button" title="Liên kết" :class="cn('grid place-items-center w-7 h-7 rounded-md-ln cursor-pointer hover:bg-paper-1', editor?.isActive('link') && 'bg-son-soft text-son-deep')" @click="toggleLink">
          <LnIcon name="link" :size="15" />
        </button>
      </div>
      <EditorContent :editor="editor" class="px-[13px] py-[11px] font-body text-[0.9375rem] text-ink min-h-[140px] max-h-[360px] overflow-y-auto" />
    </div>
  </div>
</template>

<style>
.ln-rich-content {
  outline: none;
}
.ln-rich-content p { margin-bottom: 0.75em; }
.ln-rich-content p:last-child { margin-bottom: 0; }
.ln-rich-content h2 { font-weight: 700; font-size: 1.25em; margin: 0.5em 0; }
.ln-rich-content ul, .ln-rich-content ol { padding-left: 1.4em; margin-bottom: 0.75em; }
.ln-rich-content blockquote { border-left: 3px solid var(--line-strong); padding-left: 0.9em; color: var(--ink-3); }
.ln-rich-content a { color: var(--son); text-decoration: underline; }
.ln-rich-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--ink-4);
  float: left;
  pointer-events: none;
  height: 0;
}
</style>
