import { Ref } from "vue"

export interface Song {
  id: number
  title: string
  artist: string
  album: string
  cover: string
  duration: string
  audioUrl: string
}

export class AudioVisualizer {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array<ArrayBuffer> | null = null
  private animationId: number | null = null
  private canvas: HTMLCanvasElement | null = null

  SetupContext(audioElement: HTMLAudioElement): void {
    if (this.audioContext) return

    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)()
    const source = this.audioContext.createMediaElementSource(audioElement)
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 128

    source.connect(this.analyser)
    this.analyser.connect(this.audioContext.destination)

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
  }

  InitCanvas(canvasElement: HTMLCanvasElement): void {
    this.canvas = canvasElement
    this.canvas.width = this.canvas.offsetWidth * window.devicePixelRatio
    this.canvas.height = this.canvas.offsetHeight * window.devicePixelRatio

    const ctx = this.canvas.getContext("2d")
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
  }

  StartDrawing(): void {
    if (!this.canvas || !this.analyser || !this.dataArray) return

    const ctx = this.canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      this.animationId = requestAnimationFrame(draw)

      this.analyser!.getByteFrequencyData(this.dataArray!)

      ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height)

      const barWidth = this.canvas!.width / this.dataArray!.length
      const centerY = this.canvas!.height / 2

      for (let i = 0; i < this.dataArray!.length; i++) {
        const barHeight =
          (this.dataArray![i] / 255) * (this.canvas!.height * 0.8)
        const x = i * barWidth

        const gradient = ctx.createLinearGradient(
          0,
          centerY - barHeight / 2,
          0,
          centerY + barHeight / 2
        )
        gradient.addColorStop(
          0,
          `rgba(99, 102, 241, ${0.8 - (i / this.dataArray!.length) * 0.3})`
        )
        gradient.addColorStop(
          0.5,
          `rgba(168, 85, 247, ${0.9 - (i / this.dataArray!.length) * 0.3})`
        )
        gradient.addColorStop(
          1,
          `rgba(236, 72, 153, ${0.7 - (i / this.dataArray!.length) * 0.3})`
        )

        ctx.fillStyle = gradient
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 2, barHeight)
      }
    }

    draw()
  }

  Cleanup(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

export class AudioController {
  private audio: HTMLAudioElement
  private visualizer: AudioVisualizer

  constructor(audioElement: HTMLAudioElement, visualizer: AudioVisualizer) {
    this.audio = audioElement
    this.visualizer = visualizer
  }

  async TogglePlay(isPlaying: Ref<boolean>): Promise<void> {
    if (isPlaying.value) {
      this.audio.pause()
      isPlaying.value = false
    } else {
      try {
        await this.audio.play()
        isPlaying.value = true
      } catch (error) {
        console.error("Playback failed:", error)
        isPlaying.value = false
      }
    }
  }

  async SelectSong(
    song: Song,
    currentSong: Ref<Song>,
    isPlaying: Ref<boolean>,
    currentTime: Ref<number>
  ): Promise<void> {
    const wasPlaying = isPlaying.value

    if (this.audio) {
      this.audio.pause()
    }

    currentSong.value = song
    currentTime.value = 0
    isPlaying.value = false

    if (wasPlaying) {
      try {
        await this.audio.play()
        isPlaying.value = true
      } catch (error) {
        console.error("Playback failed:", error)
      }
    }
  }

  Seek(event: MouseEvent, duration: number): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    this.audio.currentTime = percent * duration
  }

  ChangeVolume(value: number): void {
    this.audio.volume = value
  }

  NextSong(
    songs: Song[],
    currentSong: Ref<Song>,
    isPlaying: Ref<boolean>,
    currentTime: Ref<number>
  ): void {
    const currentIndex = songs.findIndex((s) => s.id === currentSong.value.id)
    const nextIndex = (currentIndex + 1) % songs.length
    this.SelectSong(songs[nextIndex], currentSong, isPlaying, currentTime)
  }

  PreviousSong(
    songs: Song[],
    currentSong: Ref<Song>,
    isPlaying: Ref<boolean>,
    currentTime: Ref<number>
  ): void {
    const currentIndex = songs.findIndex((s) => s.id === currentSong.value.id)
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length
    this.SelectSong(songs[prevIndex], currentSong, isPlaying, currentTime)
  }
}

export function FormatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
