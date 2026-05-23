// Pure argv parsing helpers shared between maiass.mjs and unit tests.
//
// Kept dependency-free and side-effect-free so it can be imported in a unit
// test without triggering maiass.mjs's top-level CLI bootstrap.

/**
 * Extract the -m / --message commit-message value from argv (MAI-51 parity).
 *
 * Supported forms (single value only — NOT git-style repeated -m):
 *   -m <value>
 *   --message <value>
 *   --message=<value>
 *
 * The value is taken VERBATIM (no escape-sequence interpretation, no newline
 * collapsing). Only the whole-string leading/trailing whitespace is trimmed,
 * and that trimming happens at the point of use (lib/commit.js) so that empty /
 * whitespace-only values still fall through to the "No commit message provided"
 * path. Here we return the raw string.
 *
 * Last occurrence wins if the flag appears more than once.
 *
 * @param {string[]} argv
 * @returns {{ message: string|null, valueIndices: Set<number> }}
 *   message      — the raw message string, or null if -m/--message not present.
 *   valueIndices — argv positions of the VALUE token only (the space-separated
 *                  form's value). The flag tokens (-m/--message) are NOT included
 *                  because (a) they start with '-' so command derivation already
 *                  skips them, and (b) the flag-validator still needs to validate
 *                  them against the allow-list. The value token is recorded so
 *                  command derivation doesn't mistake it for a command/bump type
 *                  and so the validator skips it if it happens to start with '-'.
 */
export function extractMessageFlag(argv) {
  let message = null;
  const valueIndices = new Set();
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-m' || arg === '--message') {
      if (i + 1 < argv.length) {
        message = argv[i + 1];
        valueIndices.add(i + 1);
      } else {
        // Flag given with no following token — treat as empty so it falls
        // through to the "No commit message provided" error rather than
        // silently consuming nothing.
        message = '';
      }
    } else if (arg.startsWith('--message=')) {
      message = arg.slice('--message='.length);
      valueIndices.add(i);
    }
  }
  return { message, valueIndices };
}
