/**
 * Generates a high-precision Unix timestamp in nanoseconds.
 * * This function combines the current millisecond-accurate Unix Epoch (Wall Clock)
 * with the nanosecond-accurate `process.hrtime.bigint()` (Monotonic Clock) to 
 * provide a 19-digit timestamp while minimizing collisions.
 * * @returns {bigint} The current Unix timestamp in nanoseconds.
 * * @example
 * const ts = getPreciseTimestamp();
 * console.log(ts); // 1704960000123456789n
 */
export function getPreciseTimestamp() {
  return (BigInt(Date.now()) * 1_000_000n) + (process.hrtime.bigint() % 1_000_000n);
}