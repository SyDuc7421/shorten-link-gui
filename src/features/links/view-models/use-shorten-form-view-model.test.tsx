import { beforeEach, describe, expect, it, vi } from 'vitest';

import messages from '@messages/en.json';
import { HttpError } from '@/lib/http';
import { act, renderHook } from '@/test/utils';

import { useShortenLink } from '../model/links-api';
import type { ShortenedLink, ShortenInput } from '../model/types';
import { useShortenFormViewModel } from './use-shorten-form-view-model';

vi.mock('../model/links-api', () => ({ useShortenLink: vi.fn() }));

interface MutateOptions {
  onSuccess?: (link: ShortenedLink) => void;
  onError?: (error: unknown) => void;
}

const mutate = vi.fn<(input: ShortenInput, options: MutateOptions) => void>();

beforeEach(() => {
  mutate.mockReset();
  vi.mocked(useShortenLink).mockReturnValue({ mutate, isPending: false } as unknown as ReturnType<
    typeof useShortenLink
  >);
});

async function submitUrl(url: string) {
  const view = renderHook(() => useShortenFormViewModel());
  act(() => view.result.current.form.setValue('url', url));
  await act(() => view.result.current.onSubmit());
  return view;
}

describe('useShortenFormViewModel', () => {
  it('rejects a URL without http(s) before calling the API', async () => {
    const view = await submitUrl('ftp://example.com');
    expect(mutate).not.toHaveBeenCalled();
    expect(view.result.current.form.formState.errors.url?.message).toBe(messages.links.invalidUrl);
  });

  it('shows the short link and resets the form on success', async () => {
    const link = { code: 'abc', short_url: 'https://short.link/abc', expires_at: null };
    mutate.mockImplementation((_input, options) => options.onSuccess?.(link));

    const view = await submitUrl('https://example.com/page');

    expect(mutate.mock.calls[0]?.[0]).toEqual({
      url: 'https://example.com/page',
      alias: null,
      expiresAt: null,
    });
    expect(view.result.current.result).toEqual(link);
    expect(view.result.current.form.getValues('url')).toBe('');
  });

  it('sends the expiry as RFC 3339 only while the expiry field is shown', async () => {
    const view = renderHook(() => useShortenFormViewModel());
    act(() => {
      view.result.current.addExpiry();
      view.result.current.form.setValue('url', 'https://example.com');
      view.result.current.form.setValue('expiresAt', '2099-01-02T03:04');
    });
    await act(() => view.result.current.onSubmit());

    expect(mutate.mock.calls[0]?.[0].expiresAt).toMatch(/^2099-01-0\dT\d{2}:04:00Z$/);
  });

  it('puts a blocked URL error on the url field', async () => {
    mutate.mockImplementation((_input, options) => options.onError?.(new HttpError(422, {})));
    const view = await submitUrl('https://example.com');
    expect(view.result.current.form.formState.errors.url?.message).toBe(
      messages.links.forbiddenUrl,
    );
  });

  it('reports rate limits and network failures at form level', async () => {
    mutate.mockImplementationOnce((_input, options) => options.onError?.(new HttpError(429, {})));
    const view = await submitUrl('https://example.com');
    expect(view.result.current.rootError).toBe(messages.links.rateLimited);

    mutate.mockImplementationOnce((_input, options) => options.onError?.(new TypeError('offline')));
    await act(() => view.result.current.onSubmit());
    expect(view.result.current.rootError).toBe(messages.errors.network);
  });

  it('sends the alias only while the alias field is shown', async () => {
    const view = renderHook(() => useShortenFormViewModel());
    act(() => {
      view.result.current.form.setValue('url', 'https://example.com');
      view.result.current.form.setValue('alias', 'Sale-2026');
    });
    await act(() => view.result.current.onSubmit());
    expect(mutate.mock.calls[0]?.[0].alias).toBeNull();

    act(() => view.result.current.addAlias());
    await act(() => view.result.current.onSubmit());
    expect(mutate.mock.calls[1]?.[0].alias).toBe('Sale-2026');
  });

  it('rejects a reserved alias before calling the API', async () => {
    const view = renderHook(() => useShortenFormViewModel());
    act(() => {
      view.result.current.addAlias();
      view.result.current.form.setValue('url', 'https://example.com');
      view.result.current.form.setValue('alias', 'API');
    });
    await act(() => view.result.current.onSubmit());

    expect(mutate).not.toHaveBeenCalled();
    expect(view.result.current.form.formState.errors.alias?.message).toBe(
      messages.links.aliasReserved.replace('{alias}', 'API'),
    );
  });

  it('puts a taken alias on the alias field', async () => {
    mutate.mockImplementation((_input, options) => options.onError?.(new HttpError(409, {})));
    const view = renderHook(() => useShortenFormViewModel());
    act(() => {
      view.result.current.addAlias();
      view.result.current.form.setValue('url', 'https://example.com');
      view.result.current.form.setValue('alias', 'taken1');
    });
    await act(() => view.result.current.onSubmit());

    expect(view.result.current.form.formState.errors.alias?.message).toBe(
      messages.links.aliasTaken.replace('{alias}', 'taken1'),
    );
  });
});
