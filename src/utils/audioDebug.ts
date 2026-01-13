export const DEBUG_AUDIO_TAIL_SECONDS = 10;

export const getDebugTailPosition = (durationMillis?: number | null) => {
  if (!durationMillis || durationMillis <= 0) return 0;
  const tail = DEBUG_AUDIO_TAIL_SECONDS * 1000;
  if (durationMillis <= tail) return 0;
  return Math.max(0, durationMillis - tail);
};
