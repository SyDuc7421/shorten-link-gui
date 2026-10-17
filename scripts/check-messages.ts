/**
 * Fails if any locale file drifts from the reference locale (en):
 * missing keys, extra keys, or a mismatched placeholder set.
 * Wired into `pnpm i18n:check` and CI.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const MESSAGES_DIR = join(process.cwd(), 'messages');
const REFERENCE = 'en';

type Messages = Record<string, unknown>;

function flatten(input: Messages, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(input)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object') {
      for (const [k, v] of flatten(value as Messages, path)) out.set(k, v);
    } else {
      out.set(path, String(value));
    }
  }
  return out;
}

const placeholders = (value: string) =>
  [...value.matchAll(/\{(\w+)/g)]
    .map((match) => match[1])
    .sort()
    .join(',');

const read = (locale: string) =>
  flatten(JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8')) as Messages);

const reference = read(REFERENCE);
const locales = readdirSync(MESSAGES_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace('.json', ''))
  .filter((locale) => locale !== REFERENCE);

let failed = false;

for (const locale of locales) {
  const current = read(locale);

  for (const [key, value] of reference) {
    if (!current.has(key)) {
      console.error(`[${locale}] missing key: ${key}`);
      failed = true;
    } else if (placeholders(current.get(key)!) !== placeholders(value)) {
      console.error(`[${locale}] placeholder mismatch: ${key}`);
      failed = true;
    }
  }

  for (const key of current.keys()) {
    if (!reference.has(key)) {
      console.error(`[${locale}] key not in ${REFERENCE}: ${key}`);
      failed = true;
    }
  }
}

console.log(
  failed ? 'Message files are out of sync.' : `Message files are in sync (${locales.length + 1}).`,
);
process.exit(failed ? 1 : 0);
