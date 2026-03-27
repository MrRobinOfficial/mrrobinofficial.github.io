// components/YouTube.vue
<script setup lang="ts">
import { ref, computed } from "vue"

interface Props {
  /// YouTube video ID or full URL
  id: string
  /// Start time in seconds
  start?: number
  /// End time in seconds
  end?: number
  /// Auto-play on load
  autoplay?: boolean
  /// Show controls
  controls?: boolean
  /// Loop video
  loop?: boolean
  /// Mute audio
  muted?: boolean
  /// Aspect ratio (default: 16/9)
  ratio?: string
  /// Custom width
  width?: string
  /// Caption/title below video
  caption?: string
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  controls: true,
  loop: false,
  muted: false,
  ratio: "16/9",
  width: "100%",
})

const isLoaded = ref(false)

/// <summary>
/// Extract video ID from various YouTube URL formats
/// </summary>
const videoId = computed(() => {
  const { id } = props

  // Already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return id
  }

  // Extract from URL
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = id.match(pattern)
    if (match?.[1]) {
      return match[1]
    }
  }

  return id
})

/// <summary>
/// Generate thumbnail URL
/// </summary>
const thumbnailUrl = computed(() => {
  return `https://img.youtube.com/vi/${videoId.value}/maxresdefault.jpg`
})

/// <summary>
/// Generate embed URL with parameters
/// </summary>
const embedUrl = computed(() => {
  const params = new URLSearchParams({
    autoplay: props.autoplay || isLoaded.value ? "1" : "0",
    controls: props.controls ? "1" : "0",
    loop: props.loop ? "1" : "0",
    muted: props.muted ? "1" : "0",
    modestbranding: "1",
    rel: "0",
  })

  if (props.start) {
    params.append("start", props.start.toString())
  }

  if (props.end) {
    params.append("end", props.end.toString())
  }

  if (props.loop) {
    params.append("playlist", videoId.value)
  }

  return `https://www.youtube-nocookie.com/embed/${videoId.value}?${params}`
})

/// <summary>
/// Container styles with aspect ratio
/// </summary>
const containerStyles = computed(() => ({
  width: props.width,
  aspectRatio: props.ratio,
}))

/// <summary>
/// Load video on user interaction
/// </summary>
function loadVideo() {
  isLoaded.value = true
}
</script>

<template>
  <figure class="youtube-embed" :style="containerStyles">
    <div class="youtube-container">
      <!-- Thumbnail preview -->
      <div
        v-if="!isLoaded"
        class="youtube-preview"
        @click="loadVideo"
        @keydown.enter.space.prevent="loadVideo"
        tabindex="0"
        role="button"
        :aria-label="`Play YouTube video ${videoId}`"
      >
        <img
          :src="thumbnailUrl"
          :alt="`YouTube video ${videoId}`"
          class="youtube-thumbnail"
          loading="lazy"
        />
        <div class="youtube-play-overlay">
          <div class="youtube-play-button">
            <svg viewBox="0 0 68 48" width="68" height="48">
              <path
                d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                fill="#f00"
              ></path>
              <path d="M 45,24 27,14 27,34" fill="#fff"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Embedded iframe -->
      <iframe
        v-else
        :src="embedUrl"
        class="youtube-iframe"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        :title="`YouTube video player: ${videoId}`"
      />
    </div>

    <!-- Optional caption -->
    <figcaption v-if="caption" class="youtube-caption">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.youtube-embed {
  margin: 2rem 0;
  max-width: 100%;
}

.youtube-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
  box-shadow:
    0 4px 6px -1px rgb(0 0 0 / 0.1),
    0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.youtube-preview {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.youtube-preview:hover {
  transform: scale(1.02);
}

.youtube-preview:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #3b82f6);
  outline-offset: 2px;
}

.youtube-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.youtube-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  transition: background 0.2s ease;
}

.youtube-preview:hover .youtube-play-overlay {
  background: rgba(0, 0, 0, 0.2);
}

.youtube-play-button {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  opacity: 0.9;
}

.youtube-preview:hover .youtube-play-button {
  transform: scale(1.1);
  opacity: 1;
}

.youtube-iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.youtube-caption {
  margin-top: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

@media (max-width: 768px) {
  .youtube-embed {
    margin: 1.5rem 0;
  }
}
</style>
