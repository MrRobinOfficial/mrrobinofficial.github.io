<script setup lang="ts"></script>

<template>
  <div
    class="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center bg-(--vp-c-bg) text-(--vp-c-text-1) overflow-hidden"
  >
    <div class="text-center px-4">
      <div class="text-8xl mb-6 animate-bounce">🚧</div>
      <h1 class="text-4xl font-bold mb-2">Work in Progress</h1>
      <p class="text-lg opacity-70">
        This page is under construction. Check back soon!
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
