<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue"
import { GradientBackground } from "#components/ui"
import songs from "#data/projects/songs.json"
import {
  AudioVisualizer,
  AudioController,
  FormatTime,
  type Song,
} from "#utils/audioUtils"

const currentSong = ref<Song>(songs[0])
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const showPlaylist = ref(false)

const canvas = ref<HTMLCanvasElement | null>(null)
const audio = ref<HTMLAudioElement | null>(null)

let visualizer: AudioVisualizer | null = null
let controller: AudioController | null = null

const progress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const togglePlay = async () => {
  if (!controller || !audio.value) return

  if (!visualizer) {
    visualizer = new AudioVisualizer()
    visualizer.SetupContext(audio.value)
    if (canvas.value) {
      visualizer.InitCanvas(canvas.value)
      visualizer.StartDrawing()
    }
  }

  await controller.TogglePlay(isPlaying)
}

const selectSong = async (song: Song) => {
  if (!controller || !audio.value) return

  // Reset audio
  audio.value.pause()
  currentTime.value = 0
  isPlaying.value = false

  // Switch to the new song
  currentSong.value = song
  audio.value.src = song.audioUrl
  audio.value.load()

  // Optional: autoplay new song
  await audio.value.play()
}

const nextSong = () => {
  if (!controller) return
  controller.NextSong(songs, currentSong, isPlaying, currentTime)
}

const previousSong = () => {
  if (!controller) return
  controller.PreviousSong(songs, currentSong, isPlaying, currentTime)
}

const seek = (event: MouseEvent) => {
  if (!controller) return
  controller.Seek(event, duration.value)
}

const changeVolume = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value)
  volume.value = value
  if (controller) {
    controller.ChangeVolume(value)
  }
}

watch(currentSong, () => {
  if (audio.value) {
    audio.value.src = currentSong.value.audioUrl
    audio.value.load()
  }
})

onMounted(() => {
  if (audio.value) {
    visualizer = new AudioVisualizer()
    controller = new AudioController(audio.value, visualizer)

    audio.value.volume = volume.value
    audio.value.addEventListener("timeupdate", () => {
      currentTime.value = audio.value?.currentTime || 0
    })
    audio.value.addEventListener("loadedmetadata", () => {
      duration.value = audio.value?.duration || 0
    })

    audio.value.addEventListener("play", () => {
      isPlaying.value = true
    })
    audio.value.addEventListener("pause", () => {
      isPlaying.value = false
    })
    audio.value.addEventListener("ended", () => {
      isPlaying.value = false
      currentTime.value = 0
    })

    if (canvas.value) {
      visualizer.InitCanvas(canvas.value)
    }
  }
})

onUnmounted(() => {
  if (visualizer) {
    visualizer.Cleanup()
  }
})

function groupSongsByAlbum(songs: Song[]) {
  const albumsMap = new Map()

  songs.forEach((song) => {
    if (!albumsMap.has(song.album)) {
      albumsMap.set(song.album, {
        id: `album-${albumsMap.size + 1}`,
        title: song.album,
        artist: song.artist, // can be refined if multiple artists
        cover: song.cover,
        expanded: false,
        songs: [],
      })
    }

    albumsMap.get(song.album).songs.push({
      id: song.id,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      releaseDate: null, // optional song.releaseDate ||
      audioUrl: song.audioUrl,
    })
  })

  return Array.from(albumsMap.values())
}

const albums = ref(groupSongsByAlbum(songs))
</script>

<template>
  <div class="page">
    <GradientBackground />

    <div class="page-content">
      <!-- Main Player Card -->
      <div
        class="w-full backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div class="grid lg:grid-cols-2">
          <!-- Album Art -->
          <div
            class="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20"
          >
            <img
              :src="currentSong.cover"
              :alt="currentSong.title"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            ></div>

            <!-- Song Info Overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <h2
                class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg"
              >
                {{ currentSong.title }}
              </h2>
              <p class="text-lg sm:text-xl text-purple-200 drop-shadow-lg">
                {{ currentSong.artist }}
              </p>
            </div>
          </div>

          <!-- Controls & Visualizer -->
          <div class="flex flex-col">
            <!-- Visualizer -->
            <div
              class="relative h-24 sm:h-32 bg-black/40 backdrop-blur-xl border-b border-white/5"
            >
              <canvas
                ref="canvas"
                class="w-full h-full"
                style="display: block"
              ></canvas>
            </div>

            <!-- Controls -->
            <div class="p-6 sm:p-8 space-y-6 flex-1 flex flex-col">
              <!-- Progress Bar -->
              <div class="space-y-2">
                <div
                  @click="seek"
                  class="h-1.5 bg-white/10 rounded-full cursor-pointer relative overflow-hidden group"
                >
                  <div
                    class="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                    :style="{ width: `${progress}%` }"
                  ></div>
                  <div
                    class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    :style="{ left: `calc(${progress}% - 6px)` }"
                  ></div>
                </div>
                <div
                  class="flex justify-between text-xs sm:text-sm text-purple-300/60"
                >
                  <span>{{ FormatTime(currentTime) }}</span>
                  <span>{{ currentSong.duration }}</span>
                </div>
              </div>

              <!-- Main Controls -->
              <div class="flex items-center justify-between gap-4 mt-auto">
                <!-- Playlist Button -->
                <button
                  @click="showPlaylist = !showPlaylist"
                  class="p-2.5 hover:bg-white/10 rounded-full transition-all backdrop-blur-sm"
                  title="Playlist"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    />
                  </svg>
                </button>

                <!-- Playback Controls -->
                <div class="flex items-center gap-3 sm:gap-4">
                  <button
                    @click="previousSong"
                    class="p-2.5 hover:bg-white/10 rounded-full transition-all hover:scale-110"
                    title="Previous"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z"
                      />
                    </svg>
                  </button>

                  <button
                    @click="togglePlay"
                    class="p-4 sm:p-5 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full transition-all shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
                    title="Play/Pause"
                  >
                    <svg
                      v-if="!isPlaying"
                      class="w-6 h-6 sm:w-7 sm:h-7"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="w-6 h-6 sm:w-7 sm:h-7"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z"
                      />
                    </svg>
                  </button>

                  <button
                    @click="nextSong"
                    class="p-2.5 hover:bg-white/10 rounded-full transition-all hover:scale-110"
                    title="Next"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Volume -->
                <div class="flex items-center gap-2 sm:gap-3 flex-1 max-w-32">
                  <svg
                    class="w-4 h-4 text-purple-300 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    :value="volume"
                    @input="changeVolume"
                    class="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Playlist Modal -->
    <Transition name="modal">
      <div
        v-if="showPlaylist"
        @click="showPlaylist = false"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <div
          @click.stop
          class="w-full max-w-3xl max-h-[80vh] backdrop-blur-3xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
        >
          <!-- Header -->
          <div
            class="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/20 backdrop-blur-xl"
          >
            <h3 class="text-2xl font-bold text-white">Playlist</h3>
            <button
              @click="showPlaylist = false"
              class="p-2 hover:bg-white/10 rounded-full transition-all"
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
          </div>

          <!-- Albums Tree -->
          <div class="overflow-y-auto max-h-[calc(80vh-88px)] p-4 space-y-4">
            <div
              v-for="album in albums"
              :key="album.id"
              class="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
            >
              <!-- Album Header -->
              <button
                class="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors"
                @click="album.expanded = !album.expanded"
              >
                <div class="flex items-center gap-4">
                  <img
                    :src="album.cover"
                    :alt="album.title"
                    class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shadow-lg"
                  />
                  <div class="text-left">
                    <p class="text-white font-semibold">{{ album.title }}</p>
                    <p class="text-sm text-purple-300/60">{{ album.artist }}</p>
                  </div>
                </div>
                <svg
                  :class="[
                    'w-5 h-5 text-purple-300 transition-transform',
                    album.expanded ? 'rotate-90' : 'rotate-0',
                  ]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <!-- Songs List -->
              <transition name="fade">
                <div
                  v-show="album.expanded"
                  class="divide-y divide-white/10 bg-black/20"
                >
                  <div
                    v-for="song in album.songs"
                    :key="song.id"
                    @click="selectSong(song)"
                    :class="[
                      'flex items-center gap-4 p-4 cursor-pointer transition-all',
                      currentSong.id === song.id
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-l-4 border-purple-400'
                        : 'hover:bg-white/5',
                    ]"
                  >
                    <div class="flex-1 min-w-0">
                      <p class="text-white font-medium truncate">
                        {{ song.title }}
                      </p>
                      <p class="text-sm text-purple-300/60 truncate">
                        {{ song.artist }}
                      </p>
                    </div>
                    <div
                      class="flex flex-col items-end text-sm text-purple-400/60"
                    >
                      <span>{{ song.duration }}</span>
                      <span>{{ song.releaseDate }}</span>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Hidden audio element -->
    <audio ref="audio"></audio>
  </div>
</template>

<style scoped>
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.6);
}

.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a855f7, #ec4899);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
  transition: all 0.2s;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.6);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.3s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
