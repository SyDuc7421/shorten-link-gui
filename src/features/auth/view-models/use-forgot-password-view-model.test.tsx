import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import messages from '@messages/en.json';
import { HttpError } from '@/lib/http';
import { act, renderHook } from '@/test/utils';

import { useForgotPasswordMutation } from '../model/password-reset-api';
import { useSession, type SessionStatus } from '../model/use-session';
import {
  RESEND_COOLDOWN_SECONDS,
  useForgotPasswordViewModel,
} from './use-forgot-password-view-model';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../model/password-reset-api', () => ({ useForgotPasswordMutation: vi.fn() }));
vi.mock('../model/use-session', () => ({ useSession: vi.fn() }));

interface MutateOptions {
  onSuccess: () => void;
  onError: (error: unknown) => void;
}
const mutate = vi.fn<(email: string, options: MutateOptions) => void>();

function setup(
  { status = 'signedOut', isPending = false } = {} as {
    status?: SessionStatus;
    isPending?: boolean;
  },
) {
  vi.mocked(useSession).mockReturnValue({ status, email: null, signOut: vi.fn() });
  vi.mocked(useForgotPasswordMutation).mockReturnValue({
    mutate,
    isPending,
  } as unknown as ReturnType<typeof useForgotPasswordMutation>);
}

async function submitEmail(email = 'a@example.com') {
  const view = renderHook(() => useForgotPasswordViewModel());
  act(() => view.result.current.form.setValue('email', email));
  await act(() => view.result.current.onSubmit());
  return view;
}

describe('useForgotPasswordViewModel', () => {
  beforeEach(() => {
    mutate.mockReset();
    replace.mockReset();
    setup();
  });
  afterEach(() => vi.useRealTimers());

  it('starts on the form', () => {
    expect(renderHook(() => useForgotPasswordViewModel()).result.current.state).toEqual({
      status: 'form',
    });
  });

  it('validates the email before sending', async () => {
    const view = await submitEmail('not-an-email');
    expect(mutate).not.toHaveBeenCalled();
    expect(view.result.current.form.formState.errors.email?.message).toBe(
      messages.validation.email,
    );
  });

  it('exposes the pending flag while submitting', () => {
    setup({ isPending: true });
    expect(renderHook(() => useForgotPasswordViewModel()).result.current.isPending).toBe(true);
  });

  it('shows the same sent state for any well-formed email, with resend on cooldown', async () => {
    mutate.mockImplementation((_email, options) => options.onSuccess());
    const view = await submitEmail('someone@example.com');

    const { state } = view.result.current;
    if (state.status !== 'sent') throw new Error(`unexpected ${state.status}`);
    expect(state.email).toBe('someone@example.com');
    expect(state.resendIn).toBe(RESEND_COOLDOWN_SECONDS);
    expect(state.hasResent).toBe(false);
  });

  it('counts down, then resends to the same address', async () => {
    vi.useFakeTimers();
    mutate.mockImplementation((_email, options) => options.onSuccess());
    const view = await submitEmail('someone@example.com');

    for (let second = 0; second < RESEND_COOLDOWN_SECONDS; second += 1) {
      act(() => vi.advanceTimersByTime(1000));
    }
    const before = view.result.current.state;
    if (before.status !== 'sent') throw new Error(`unexpected ${before.status}`);
    expect(before.resendIn).toBe(0);

    act(() => before.resend());
    expect(mutate).toHaveBeenLastCalledWith('someone@example.com', expect.anything());
    const after = view.result.current.state;
    if (after.status !== 'sent') throw new Error(`unexpected ${after.status}`);
    expect(after.hasResent).toBe(true);
    expect(after.resendIn).toBe(RESEND_COOLDOWN_SECONDS);
  });

  it.each([
    [new HttpError(429, null), messages.auth.tooManyAttempts],
    [new TypeError('offline'), messages.errors.network],
    [new HttpError(500, null), messages.errors.server],
  ])('reports %o at form level', async (error, message) => {
    mutate.mockImplementation((_email, options) => options.onError(error));
    const view = await submitEmail();
    expect(view.result.current.rootError).toBe(message);
    expect(view.result.current.state.status).toBe('form');
  });

  it('sends a signed-in user home', () => {
    setup({ status: 'signedIn' });
    renderHook(() => useForgotPasswordViewModel());
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('drops an earlier "sent again" when a later resend fails', async () => {
    vi.useFakeTimers();
    mutate.mockImplementation((_email, options) => options.onSuccess());
    const view = await submitEmail('someone@example.com');
    const waitOut = () => {
      for (let second = 0; second < RESEND_COOLDOWN_SECONDS; second += 1) {
        act(() => vi.advanceTimersByTime(1000));
      }
    };

    waitOut();
    const first = view.result.current.state;
    if (first.status !== 'sent') throw new Error(`unexpected ${first.status}`);
    act(() => first.resend());
    waitOut();

    mutate.mockImplementation((_email, options) => options.onError(new HttpError(429, null)));
    const second = view.result.current.state;
    if (second.status !== 'sent') throw new Error(`unexpected ${second.status}`);
    act(() => second.resend());

    const after = view.result.current.state;
    if (after.status !== 'sent') throw new Error(`unexpected ${after.status}`);
    expect(after.hasResent).toBe(false);
    expect(view.result.current.rootError).toBe(messages.auth.tooManyAttempts);
  });
});
