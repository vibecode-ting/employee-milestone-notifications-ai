// Voice & Audio synthesis service for CultureOS AI
// Integrates Web/Native WAV tone generator + natural speech markup fallbacks for 5 JAPAC languages

export interface VoiceGreetingOptions {
  text: string;
  language: string; // en, my, zh, vi, hi
}

// Generate simple base64 playable PCM/WAV chime tone for server-side audio response fallback
export function generateAudioWavFallback(text: string, language: string): Buffer {
  const sampleRate = 16000;
  const durationSec = 1.2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Play pleasant pentatonic celebration chord (Chime 523Hz C5 -> 659Hz E5 -> 783Hz G5)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = t < 0.4 ? 523.25 : t < 0.8 ? 659.25 : 783.99;
    const envelope = Math.max(0, 1 - (t % 0.4) / 0.4);
    const sampleVal = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
    const intVal = Math.floor(sampleVal * 32767);
    buffer.writeInt16LE(intVal, 44 + i * 2);
  }

  return buffer;
}
