/**
 * Generates a derangement of `arr` such that no element stays at its own index.
 * If `exclude` is provided, also tries to avoid matching those values (best-effort).
 */
export function derangement<T>(arr: T[], exclude?: (T | null)[]): T[] {
  if (arr.length < 2) throw new Error("Il faut au moins 2 participants.");
  let shuffled: T[];
  let attempts = 0;
  do {
    shuffled = [...arr].sort(() => Math.random() - 0.5);
    attempts++;
    if (attempts > 2000) {
      // Fallback: simple rotation if random keeps failing
      shuffled = [...arr.slice(1), arr[0]];
      break;
    }
  } while (
    shuffled.some((v, i) => v === arr[i]) ||
    (exclude && shuffled.some((v, i) => exclude[i] !== null && v === exclude[i]))
  );
  return shuffled;
}
