<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        @click.self="closeModal"
      >
        <div
          class="relative w-full max-w-md bg-[var(--vp-c-bg)] rounded-2xl shadow-2xl p-8 transform transition-all border border-[var(--vp-c-divider)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            @click="closeModal"
            class="absolute top-4 right-4 text-[var(--vp-c-text-2)] hover:text-[var(--vp-c-text-1)] transition-colors"
            aria-label="Close modal"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div class="mb-6">
            <h2
              id="modal-title"
              class="text-2xl font-bold text-[var(--vp-c-text-1)] mb-2"
            >
              Get in Touch
            </h2>
            <p class="text-[var(--vp-c-text-2)]">
              Send me an email or copy my address.
            </p>
          </div>

          <div class="space-y-3">
            <a
              :href="mailtoLinkWithTemplate"
              target="_self"
              class="flex items-center justify-center w-full px-6 py-4 bg-[var(--vp-c-brand-soft)] hover:bg-[var(--vp-c-brand-3)] text-[var(--vp-button-brand-text)] rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl no-underline"
              @click="handleMailtoClick"
            >
              <svg
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span class="font-medium">Open Email Client</span>
            </a>

            <button
              type="button"
              @click="copyEmail"
              class="flex items-center justify-center w-full px-6 py-4 bg-[var(--vp-c-bg-soft)] hover:bg-[var(--vp-c-bg-mute)] border-2 border-[var(--vp-c-divider)] hover:border-[var(--vp-c-brand-1)] text-[var(--vp-c-text-1)] rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                v-if="!copied"
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span class="font-medium">{{
                copied ? "Copied!" : "Copy Email Address"
              }}</span>
            </button>
          </div>

          <div class="mt-6 pt-6 border-t border-[var(--vp-c-divider)]">
            <p class="text-sm text-[var(--vp-c-text-3)] text-center font-mono">
              {{ email }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

interface Props {
  email: string
  defaultSubject?: string
  defaultBody?: string
}

const props = withDefaults(defineProps<Props>(), {
  email: "your.email@example.com",
  defaultSubject: "Portfolio Inquiry",
  defaultBody:
    "Hi,\n\nI came across your portfolio and would like to discuss...",
})

const isOpen = ref(false)
const copied = ref(false)

const mailtoLinkWithTemplate = computed(() => {
  return `mailto:${props.email}?subject=${encodeURIComponent(props.defaultSubject)}&body=${encodeURIComponent(props.defaultBody)}`
})

const openModal = () => {
  isOpen.value = true
  document.body.style.overflow = "hidden"
}

const closeModal = () => {
  isOpen.value = false
  document.body.style.overflow = ""
  copied.value = false
}

const handleMailtoClick = () => {
  setTimeout(() => {
    closeModal()
  }, 300)
}

const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(props.email)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error("Failed to copy email:", err)
  }
}

defineExpose({
  openModal,
  closeModal,
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  transform: scale(0.95);
  opacity: 0;
}
</style>
