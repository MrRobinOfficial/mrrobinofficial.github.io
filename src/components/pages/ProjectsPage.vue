<script setup lang="ts">
import { ref } from "vue"
import { motion } from "motion-v"
import GradientBackground from "#components/ui/GradientBackground.vue"
import projects from "#data/site/projects.json"

const selectedTab = ref(0)
const focusedTab = ref(-1)

function openProject(url: string) {
  if (url) {
    window.open(url, "_self")
  }
  selectedTab.value = projects.findIndex((p) => p.link === url)
}
</script>

<template>
  <div class="page text-[var(--vp-c-text-1)]">
    <GradientBackground />

    <div class="page-content">
      <!-- Page Title -->
      <div class="!text-center !mb-12">
        <h1 class="!text-5xl !font-bold !mb-4">Projects</h1>
        <p class="!text-lg">
          Explore my work across software, music, games, and more.
        </p>
      </div>

      <!-- Project Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        role="tablist"
      >
        <motion.section
          v-for="(project, index) in projects"
          :key="index"
          class="project-card relative cursor-pointer rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-md filter saturate-75 transition-all duration-200 ease-out hover:saturate-100 hover:shadow-xl group"
          role="tab"
          :aria-selected="selectedTab === index"
          tabindex="0"
          @click="openProject(project.link)"
          @focus="focusedTab = index"
          @blur="focusedTab = -1"
          @keydown.enter.space.prevent="openProject(project.link)"
          :initial="{ scale: 0.95, opacity: 0 }"
          :animate="{ scale: 1, opacity: 1 }"
          :whileHover="{ scale: 1.05 }"
          :transition="{ duration: 0.2, ease: 'easeOut' }"
          :style="{ background: project.gradient }"
        >
          <!-- Emoji and Title -->
          <span class="text-6xl mb-4 saturate-75 group-hover:saturate-100">{{
            project.emoji
          }}</span>
          <span class="text-xl font-semibold opacity-80">{{
            project.title
          }}</span>

          <!-- Tooltip -->
          <span
            class="absolute bottom-full mb-2 px-3 py-1 rounded-md text-sm text-[var(--vp-c-text-2)] bg-black/70 opacity-0 pointer-events-none transition-opacity duration-200 ease-out whitespace-nowrap"
            :class="{ 'opacity-100': focusedTab === index }"
          >
            {{ project.description }}
          </span>
        </motion.section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  background-color: rgba(255, 255, 255, 0.1); /* fallback */
  transition:
    filter 0.2s ease-out,
    box-shadow 0.2s ease-out;
}

/* Show tooltip on hover */
.project-card:hover span.absolute {
  opacity: 1;
}
</style>
