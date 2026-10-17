import { beforeEach, describe, expect, it, vi } from 'vitest';

import messages from '@messages/en.json';
import { HttpError } from '@/lib/http';
import { act, renderHook } from '@/test/utils';

import { useResetPasswordMutation } from '../model/password-reset-api';
import { useSession } from '../model/use-session';
import { useResetPasswordViewModel } from './use-reset-password-view-model';

const replace = vi.fn();
const signOut = vi.fn();
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../model/password-reset-api', () => ({ useResetPasswordMutation: vi.fn() }));
vi.mock('../model/use-session', () => ({ useSession: vi.fn() }));

interface MutateOptions {
  onSuccess: () => void;
  onError: (error: unknown) => void;
}
const mutate =
  vi.fn<(input: { token: string; password: string }, options: MutateOptions) => void>();

function setup(isPending = false, status: 'signedIn' | 'signedOut' = 'signedOut') {
  vi.mocked(useSession).mockReturnValue({ status, email: null, signOut });
  vi.mocked(useResetPasswordMutation).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useResetPasswordMutation>);
}

async function submit(password: string, confirmPassword = password, token: string | null = 'tok') {
  const view = renderHook(() => useResetPasswordViewModel(token));
  act(() => {
    view.result.current.form.setValue('password', password);
    view.result.current.form.setValue('confirmPassword', confirmPassword);
  });
  await act(() => view.result.current.onSubmit());
  return view;
}

describe('useResetPasswordViewModel', () => {
  beforeEach(() => {
    mutate.mockReset();
    replace.mockReset();
    signOut.mockReset();
    setup();
  });

  it('shows the invalid-link state when the URL has no token', () => {
    const { result } = renderHook(() => useResetPasswordViewModel(null));
    expect(result.current.state).toEqual({ status: 'missingToken' });
    expect(replace).not.toHaveBeenCalled();
  });

  it('removes the token from the address bar but keeps it for the request', async () => {
    mutate.mockImplementation((_input, options) => options.onSuccess());
    const view = renderHook(({ token }) => useResetPasswordViewModel(token), {
      initialProps: { token: 'secret-token' as string | null },
    });
    expect(replace).toHaveBeenCalledWith('/reset-password');
    expect(view.result.current.state).toEqual({ status: 'form' });

    // After the URL is cleaned the page re-renders without the token.
    view.rerender({ token: null });
    expect(view.result.current.state).toEqual({ status: 'form' });

    act(() => {
      view.result.current.form.setValue('password', 'new-password-1');
      view.result.current.form.setValue('confirmPassword', 'new-password-1');
    });
    await act(() => view.result.current.onSubmit());
    expect(mutate.mock.calls[0]?.[0]).toEqual({
      token: 'secret-token',
      password: 'new-password-1',
    });
  });

  it('checks the length and the confirmation on the client', async () => {
    const short = await submit('short');
    expect(short.result.current.form.formState.errors.password?.message).toBe(
      messages.validation.minLength.replace('{count}', '8'),
    );

    const mismatch = await submit('new-password-1', 'new-password-2');
    expect(mismatch.result.current.form.formState.errors.confirmPassword?.message).toBe(
      messages.auth.passwordMismatch,
    );
    expect(mutate).not.toHaveBeenCalled();
  });

  it('exposes the pending flag while submitting', () => {
    setup(true);
    expect(renderHook(() => useResetPasswordViewModel('tok')).result.current.isPending).toBe(true);
  });

  it('signs the local session out and shows done on success', async () => {
    mutate.mockImplementation((_input, options) => options.onSuccess());
    const view = await submit('new-password-1');
    expect(signOut).toHaveBeenCalledOnce();
    expect(view.result.current.state).toEqual({ status: 'done' });
  });

  it('switches to the expired-link state on 401', async () => {
    mutate.mockImplementation((_input, options) => options.onError(new HttpError(401, null)));
    const view = await submit('new-password-1');
    expect(view.result.current.state).toEqual({ status: 'invalidToken' });
  });

  it('puts a 400 on the password field', async () => {
    mutate.mockImplementation((_input, options) => options.onError(new HttpError(400, null)));
    const view = await submit('new-password-1');
    expect(view.result.current.form.formState.errors.password?.message).toBe(
      messages.auth.weakPassword,
    );
    expect(view.result.current.state).toEqual({ status: 'form' });
  });

  it.each([
    [new HttpError(429, null), messages.auth.tooManyAttempts],
    [new TypeError('offline'), messages.errors.network],
    [new HttpError(500, null), messages.errors.server],
  ])('reports %o at form level', async (error, message) => {
    mutate.mockImplementation((_input, options) => options.onError(error));
    const view = await submit('new-password-1');
    expect(view.result.current.rootError).toBe(message);
  });

  it('toggles both password fields together', () => {
    const { result } = renderHook(() => useResetPasswordViewModel('tok'));
    act(() => result.current.togglePasswordVisible());
    expect(result.current.isPasswordVisible).toBe(true);
  });

  it('rejects a password over 72 bytes even when it is under 72 characters', async () => {
    const view = await submit('mậtkhẩuởđâyđượcrồiđấynhémậtkhẩuởđâyđượcrồi');
    expect(view.result.current.form.formState.errors.password?.message).toBe(
      messages.auth.passwordTooLong,
    );
    expect(mutate).not.toHaveBeenCalled();
  });

  it('re-checks the confirmation when the password changes after it', async () => {
    const view = renderHook(() => useResetPasswordViewModel('tok'));
    const { form } = view.result.current;
    act(() => {
      form.setValue('confirmPassword', 'abcdefgh1', { shouldTouch: true });
      form.setValue('password', 'abcdefgh2');
    });
    await act(() => form.trigger('confirmPassword'));
    expect(view.result.current.form.formState.errors.confirmPassword?.message).toBe(
      messages.auth.passwordMismatch,
    );

    await act(async () => form.setValue('password', 'abcdefgh1'));
    await vi.waitFor(() =>
      expect(view.result.current.form.formState.errors.confirmPassword).toBeUndefined(),
    );
  });

  it('tells the view a signed-in user cannot use /forgot-password', () => {
    setup(false, 'signedIn');
    expect(renderHook(() => useResetPasswordViewModel('tok')).result.current.isSignedIn).toBe(true);
  });
});
