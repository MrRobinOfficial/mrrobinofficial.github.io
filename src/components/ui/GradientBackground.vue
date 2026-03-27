<script setup lang="ts"></script>

<template>
  <div class="gradient-background">
    <div class="gradient-overlay"></div>
  </div>
</template>

<style scoped>
.gradient-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  background:
    radial-gradient(
      ellipse 800px 600px at 20% 30%,
      rgba(99, 102, 241, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 800px 600px at 80% 70%,
      rgba(168, 85, 247, 0.12) 0%,
      transparent 50%
    );
  backdrop-filter: blur(100px);
}

.gradient-overlay {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background:
    radial-gradient(
      circle at 20% 30%,
      rgba(99, 102, 241, 0.08) 0%,
      transparent 40%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(168, 85, 247, 0.06) 0%,
      transparent 40%
    );
  filter: blur(60px);
  pointer-events: none;
}
</style>
