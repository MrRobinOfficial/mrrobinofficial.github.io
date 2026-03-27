<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { motion, AnimatePresence, delay } from "motion-v"
import myself from "#data/site/myself.json"

import {
  GradientBackground,
  ContactModal,
  AsciiAnimation,
} from "#components/ui"

// const currentTagline = ref(0)

// function cycleTaglines() {
//   currentTagline.value = (currentTagline.value + 1) % myself.taglines.length
// }

// let taglineInterval: number

// // Cycle taglines every 4 seconds
// onMounted(() => {
//   taglineInterval = window.setInterval(cycleTaglines, 4000)
// })

// onUnmounted(() => {
//   clearInterval(taglineInterval)
// })

const currentTagline = ref(0)
const showPage = ref(false)

onMounted(() => {
  showPage.value = true
  setInterval(() => {
    currentTagline.value = (currentTagline.value + 1) % myself.taglines.length
  }, 4000)
})

const contactModalRef = ref<{
  openModal: () => void
  closeModal: () => void
} | null>(null)

const openContact = () => {
  contactModalRef.value?.openModal()
}
</script>

<template>
  <div class="page">
    <GradientBackground />

    <div class="page-content">
      <ContactModal
        ref="contactModalRef"
        email="mrrobin123mail@gmail.com"
        default-subject="Portfolio Inquiry"
        default-body="Hi,&#10;&#10;I'd like to discuss a project opportunity..."
      />

      <AnimatePresence>
        <motion.section
          :initial="{ opacity: 0, y: 20 }"
          :animate="{
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, delay: 0.5 },
          }"
        >
          <div class="flex">
            <AsciiAnimation
              :fps="30"
              :frameCount="49"
              :color-overlay="true"
              gradient="radial-gradient(circle, rgba(255,0,0,1) 0%, rgba(0,0,255,1) 100%)"
              :frameFolder="'ascii/ring/frames'"
            />

            <div class="flex-1">
              <h1 class="name-gradient">
                {{ myself.firstName }}
              </h1>

              <p class="profession">{{ myself.profession }}</p>

              <!-- Motion for taglines -->
              <div class="tagline-container">
                <motion.section
                  :key="currentTagline"
                  :initial="{ opacity: 0, x: -20 }"
                  :animate="{ opacity: 1, x: 0 }"
                  :enter="{ opacity: 1, x: 0, transition: { duration: 0.5 } }"
                  :leave="{ opacity: 0, x: 20, transition: { duration: 0.5 } }"
                >
                  <p class="tagline">{{ myself.taglines[currentTagline] }}</p>
                </motion.section>
              </div>

              <div class="cta-buttons">
                <a href="/projects" class="btn btn-primary">View Work</a>
                <a
                  aria-label="Contact Me"
                  class="btn btn-secondary cursor-pointer"
                  @click="openContact"
                  >Get in Touch</a
                >
              </div>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>
    </div>
  </div>
</template>

<style scoped>
.name-gradient {
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.profession {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  color: #64748b;
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.tagline-container {
  height: 2.5rem;
  margin: 1.5rem 0;
  position: relative;
  overflow: hidden;
}

.tagline {
  font-size: 1.125rem;
  color: #94a3b8;
  font-style: italic;
  margin: 0;
  position: absolute;
  width: 100%;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #6366f1;
  border: 2px solid #6366f1;
}

.btn-secondary:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .cta-buttons {
    justify-content: center;
  }
}

.flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

/* Tablet + mobile */
@media (max-width: 1024px) {
  .flex {
    flex-direction: column;
    text-align: center;
  }
}
</style>
