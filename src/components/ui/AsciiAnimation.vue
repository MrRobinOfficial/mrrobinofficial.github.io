<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue"

interface Props {
  frames?: string[]
  fps?: number
  colorOverlay?: boolean
  frameCount?: number
  frameFolder?: string
  showDebug?: boolean
  gradient?: string
}

const props = withDefaults(defineProps<Props>(), {
  fps: 24,
  colorOverlay: false,
  frameCount: 60,
  frameFolder: "frames",
  showDebug: false,
  gradient:
    "linear-gradient(90deg, rgba(247,70,5,1) 0%, rgba(255,140,0,1) 100%)",
})

class AnimationManager {
  private _animation: number | null = null
  private callback: () => void
  private lastFrame = -1
  private frameTime = 1000 / 30

  constructor(callback: () => void, fps = 30) {
    this.callback = callback
    this.frameTime = 1000 / fps
  }

  updateFPS(fps: number) {
    this.frameTime = 1000 / fps
  }

  start() {
    if (this._animation != null) return
    this._animation = requestAnimationFrame(this.update)
  }

  pause() {
    if (this._animation == null) return
    this.lastFrame = -1
    cancelAnimationFrame(this._animation)
    this._animation = null
  }

  private update = (time: number) => {
    const { lastFrame } = this
    let delta = time - lastFrame
    if (this.lastFrame === -1) {
      this.lastFrame = time
    } else {
      while (delta >= this.frameTime) {
        this.callback()
        delta -= this.frameTime
        this.lastFrame += this.frameTime
      }
    }
    this._animation = requestAnimationFrame(this.update)
  }
}

const frames = ref<string[]>([])
const isLoading = ref(true)
const currentFrame = ref(0)

const animationManager = new AnimationManager(() => {
  if (frames.value.length === 0) return
  currentFrame.value = (currentFrame.value + 1) % frames.value.length
}, props.fps)

const loadFrames = async () => {
  if (props.frames) {
    frames.value = props.frames
    isLoading.value = false
    return
  }

  try {
    const frameFiles = Array.from(
      { length: props.frameCount },
      (_, i) => `frame_${String(i + 1).padStart(4, "0")}.txt`
    )

    const framePromises = frameFiles.map(async (filename) => {
      const response = await fetch(`/${props.frameFolder}/${filename}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}: ${response.status}`)
      }
      return await response.text()
    })

    const loadedFrames = await Promise.all(framePromises)
    console.log(`Loaded ${loadedFrames.length} frames`)
    frames.value = loadedFrames
    currentFrame.value = 0
  } catch (error) {
    console.error("Failed to load ASCII frames:", error)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.fps,
  (newFps) => {
    animationManager.updateFPS(newFps)
  }
)

onMounted(async () => {
  await loadFrames()

  if (frames.value.length === 0) return

  const reducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true

  if (reducedMotion) {
    return
  }

  const handleFocus = () => animationManager.start()
  const handleBlur = () => animationManager.pause()

  window.addEventListener("focus", handleFocus)
  window.addEventListener("blur", handleBlur)

  if (document.visibilityState === "visible") {
    animationManager.start()
  }

  onUnmounted(() => {
    window.removeEventListener("focus", handleFocus)
    window.removeEventListener("blur", handleBlur)
    animationManager.pause()
  })
})
</script>

<template>
  <div
    class="relative font-mono whitespace-pre overflow-hidden text-xs leading-none"
  >
    <div v-if="isLoading"></div>
    <div v-else-if="!frames.length">No frames loaded</div>
    <template v-else>
      <div v-if="showDebug">
        Frame: {{ currentFrame + 1 }}/{{ frames.length }}
      </div>
      <div class="relative">
        <div
          class="relative"
          :style="
            colorOverlay
              ? {
                  background: gradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }
              : {}
          "
        >
          {{ frames[currentFrame] }}
        </div>
      </div>
    </template>
  </div>
</template>
