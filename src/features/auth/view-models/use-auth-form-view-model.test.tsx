import { beforeEach, describe, expect, it, vi } from 'vitest';

import messages from '@messages/en.json';
import { HttpError } from '@/lib/http';
import { act, renderHook } from '@/test/utils';

import { useAuthMutation } from '../model/auth-api';
import { useSession, type SessionStatus } from '../model/use-session';
import { useAuthFormViewModel } from './use-auth-form-view-model';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('../model/auth-api', () => ({ useAuthMutation: vi.fn() }));
vi.mock('../model/use-session', () => ({ useSession: vi.fn() }));

const mutate = vi.fn<(values: unknown, options: { onError: (error: unknown) => void }) => void>();

function setup(status: SessionStatus = 'signedOut') {
  vi.mocked(useSession).mockReturnValue({ status, email: null, signOut: vi.fn() });
  vi.mocked(useAuthMutation).mockReturnValue({
    mutate,
    isPending: false,
    isSuccess: false,
  } as unknown as ReturnType<typeof useAuthMutation>);
}

async function submit(mode: 'signIn' | 'register', password: string) {
  const view = renderHook(() => useAuthFormViewModel(mode));
  act(() => {
    view.result.current.form.setValue('email', 'a@example.com');
    view.result.current.form.setValue('password', password);
  });
  await act(() => view.result.current.onSubmit());
  return view;
}

describe('useAuthFormViewModel', () => {
  beforeEach(() => {
    mutate.mockReset();
    replace.mockReset();
    setup();
  });

  it('enforces the password length only when registering', async () => {
    const register = await submit('register', 'short');
    expect(register.result.current.form.formState.errors.password?.message).toBe(
      messages.validation.minLength.replace('{count}', '8'),
    );
    expect(mutate).not.toHaveBeenCalled();

    await submit('signIn', 'short');
    expect(mutate).toHaveBeenCalledOnce();
  });

  it('reports wrong credentials at form level', async () => {
    mutate.mockImplementation((_values, options) => options.onError(new HttpError(401, null)));
    const view = await submit('signIn', 'secret-password');
    expect(view.result.current.rootError).toBe(messages.auth.invalidCredentials);
  });

  it('puts a taken email on the email field', async () => {
    mutate.mockImplementation((_values, options) => options.onError(new HttpError(409, null)));
    const view = await submit('register', 'long-enough-password');
    expect(view.result.current.form.formState.errors.email?.message).toBe(messages.auth.emailTaken);
  });

  it('leaves the page once signed in', () => {
    setup('signedIn');
    renderHook(() => useAuthFormViewModel('signIn'));
    expect(replace).toHaveBeenCalledWith('/');
  });

  it('toggles password visibility', () => {
    const { result } = renderHook(() => useAuthFormViewModel('signIn'));
    act(() => result.current.togglePasswordVisible());
    expect(result.current.isPasswordVisible).toBe(true);
  });
});
