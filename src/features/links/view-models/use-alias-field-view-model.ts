'use client';

import { useEffect, useState } from 'react';

import { env } from '@/lib/env';

import { getAliasProblem } from '../model/alias';
import { useAliasAvailability } from '../model/links-api';

/** Wait for a pause in typing — the availability check is rate limited. */
const CHECK_DELAY_MS = 400;

export type AliasStatus =
  | { status: 'idle' }
  | { status: 'reserved' }
  | { status: 'checking' }
  | { status: 'available' }
  | { status: 'taken' }
  | { status: 'unknown' };

export function useAliasFieldViewModel(alias: string) {
  const [checkedAlias, setCheckedAlias] = useState(alias);

  useEffect(() => {
    const timeout = window.setTimeout(() => setCheckedAlias(alias), CHECK_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [alias]);

  const problem = getAliasProblem(alias);
  const isSettled = checkedAlias === alias;
  const query = useAliasAvailability(checkedAlias, isSettled && problem === null);

  let state: AliasStatus;
  if (alias === '' || problem === 'invalid') {
    // Format errors come from the form schema, after blur.
    state = { status: 'idle' };
  } else if (problem === 'reserved' || query.data?.reason === 'reserved') {
    state = { status: 'reserved' };
  } else if (!isSettled || query.isPending) {
    state = { status: 'checking' };
  } else if (query.isError) {
    state = { status: 'unknown' };
  } else if (query.data.available) {
    state = { status: 'available' };
  } else if (query.data.reason === 'taken') {
    state = { status: 'taken' };
  } else {
    state = { status: 'idle' };
  }

  return {
    state,
    /** Where short links live — the API serves them from its own origin. */
    prefix: `${new URL(env.NEXT_PUBLIC_API_URL).host}/`,
  };
}
