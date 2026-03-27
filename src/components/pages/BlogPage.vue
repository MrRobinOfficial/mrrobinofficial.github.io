<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { GradientBackground } from "#components/ui"

const isVisible = ref(false)

let animationFrame: number
const animate = () => {
  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  isVisible.value = true
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <div class="page">
    <GradientBackground />

    <div class="page-content" :class="{ 'fade-in': isVisible }">
      <p>Blog</p>
    </div>
  </div>
</template>
