// Placeholder base64 audio clips. Replace with real audio later via the editor.
// These short silent WAV files prevent runtime errors and allow new Audio().play() to no-op gracefully.
const silentWav =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

export const clickSound = silentWav;
export const paperRustle = silentWav;
export const corkPop = silentWav;
export const stampSlam = silentWav;

export function playSound(src: string) {
  try {
    const a = new Audio(src);
    a.volume = 0.6;
    void a.play().catch(() => {});
  } catch {
    // ignore
  }
}
