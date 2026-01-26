/**
 * Sound notification utilities
 * Plays a chime sound when new messages arrive
 */

let audioContext: AudioContext | null = null
let audioBuffer: AudioBuffer | null = null

/**
 * Initialize audio context (required for playing sounds)
 */
function initAudio() {
  if (typeof window === 'undefined') return
  
  try {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch (error) {
    console.warn('AudioContext not supported:', error)
  }
}

/**
 * Generate a simple chime sound using Web Audio API
 * This creates a pleasant notification sound without requiring external files
 */
function generateChimeSound(): AudioBuffer | null {
  if (!audioContext) {
    initAudio()
    if (!audioContext) return null
  }

  try {
    // Create a simple two-tone chime
    const sampleRate = audioContext.sampleRate
    const duration = 0.3 // 300ms
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
    const data = buffer.getChannelData(0)

    // First tone (higher pitch)
    const freq1 = 800 // Hz
    const freq2 = 1000 // Hz
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate
      // Create a bell-like sound with two frequencies
      const wave1 = Math.sin(2 * Math.PI * freq1 * t)
      const wave2 = Math.sin(2 * Math.PI * freq2 * t)
      // Apply envelope (fade out)
      const envelope = Math.max(0, 1 - t / duration)
      // Combine waves with envelope
      data[i] = (wave1 * 0.5 + wave2 * 0.5) * envelope * 0.3 // 0.3 is volume
    }

    return buffer
  } catch (error) {
    console.warn('Failed to generate chime sound:', error)
    return null
  }
}

/**
 * Play notification chime
 * This will play a pleasant chime sound when called
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return

  try {
    // Initialize audio context if needed
    if (!audioContext) {
      initAudio()
    }

    if (!audioContext) {
      console.warn('AudioContext not available')
      return
    }

    // Generate or reuse buffer
    if (!audioBuffer) {
      audioBuffer = generateChimeSound()
    }

    if (!audioBuffer) {
      console.warn('Could not generate chime sound')
      return
    }

    // Create source and play
    const source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContext.destination)
    source.start(0)

    // Resume audio context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  } catch (error) {
    console.warn('Failed to play notification sound:', error)
  }
}

/**
 * Request user interaction to enable audio (required by some browsers)
 * Call this on user interaction (click, etc.) to enable audio
 */
export function enableAudio() {
  if (typeof window === 'undefined') return
  
  if (!audioContext) {
    initAudio()
  }
  
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

