import { toast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { act, renderHook } from '@/test/utils';
import messages from '@messages/en.json';

import type { AdminUserDetail } from '../model/types';
import { useUpdateUserQuota } from '../model/users-api';
import { useQuotaFormViewModel } from './use-quota-form-view-model';

vi.mock('../model/users-api', () => ({ useUpdateUserQuota: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

const user: AdminUserDetail = {
  id: '7311234567890123457',
  email: 'owner@example.com',
  role: 'user',
  quota_daily: 50,
  disabled_at: null,
  created_at: '2026-09-01T00:00:00Z',
  link_count: 3,
  links_today: 1,
  total_clicks: 12,
};

const mutate = vi.fn();

describe('useQuotaFormViewModel', () => {
  beforeEach(() => {
    vi.mocked(useUpdateUserQuota).mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateUserQuota>);
  });

  it.each(['-1', '1.5', '100001', 'abc', ''])('rejects %j', async (quota) => {
    const { result } = renderHook(() => useQuotaFormViewModel(user));
    act(() => result.current.form.setValue('quota', quota));
    await act(async () => result.current.onSubmit());
    expect(mutate).not.toHaveBeenCalled();
    expect(result.current.form.formState.errors.quota?.message).toBe(
      'Enter a whole number from 0 to 100,000.',
    );
  });

  it('sends the number and the reason, then toasts', async () => {
    mutate.mockImplementation((_input, options: { onSuccess: (u: AdminUserDetail) => void }) =>
      options.onSuccess({ ...user, quota_daily: 0 }),
    );
    const { result } = renderHook(() => useQuotaFormViewModel(user));
    act(() => {
      result.current.form.setValue('quota', '0');
      result.current.form.setValue('reason', ' spam ');
    });
    await act(async () => result.current.onSubmit());

    expect(mutate.mock.calls[0]?.[0]).toEqual({ id: user.id, quotaDaily: 0, reason: 'spam' });
    expect(toast.success).toHaveBeenCalledWith(messages.admin.users.quotaSaved);
    expect(result.current.form.getValues('quota')).toBe('0');
  });
});
