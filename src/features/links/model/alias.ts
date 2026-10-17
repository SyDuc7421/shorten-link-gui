import { ALIAS_PATTERN, RESERVED_ALIASES } from './types';

export type AliasProblem = 'invalid' | 'reserved';

/** Same check the API runs, so the client only asks about aliases it could accept. */
export function getAliasProblem(alias: string): AliasProblem | null {
  if (!ALIAS_PATTERN.test(alias)) return 'invalid';
  const lower = alias.toLowerCase();
  if (RESERVED_ALIASES.some((reserved) => reserved === lower)) return 'reserved';
  return null;
}
