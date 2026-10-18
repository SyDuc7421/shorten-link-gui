import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { HttpError } from '@/lib/http';
import { act, renderHook, waitFor } from '@/test/utils';
import messages from '@messages/en.json';

import { useConfirmActionViewModel } from './use-confirm-action-view-model';

vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));

function setup(onConfirm: (reason: string | null) => Promise<unknown>) {
  const onDone = vi.fn();
  const view = renderHook(() =>
    useConfirmActionViewModel({ onConfirm, successMessage: 'Done', onDone }),
  );
  act(() => view.result.current.onOpenChange(true));
  return { ...view, onDone };
}

describe('useConfirmActionViewModel', () => {
  it('sends the trimmed reason, closes, toasts and hands focus on', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const { result, onDone } = setup(onConfirm);

    act(() => result.current.onReasonChange('  spam  '));
    act(() => result.current.confirm());

    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(onConfirm).toHaveBeenCalledWith('spam');
    expect(toast.success).toHaveBeenCalledWith('Done');
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('sends null when no reason is given', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const { result } = setup(onConfirm);
    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(onConfirm).toHaveBeenCalledWith(null);
  });

  it('stops a reason over 500 bytes before it reaches the API', async () => {
    const onConfirm = vi.fn();
    const { result } = setup(onConfirm);

    act(() => result.current.onReasonChange('é'.repeat(251)));
    act(() => result.current.confirm());

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.errorMessage).toBe(messages.admin.errors.reasonTooLong);
  });

  it('stays open with the mapped message when the request fails', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new HttpError(409, { error: 'x' }));
    const { result } = setup(onConfirm);

    act(() => result.current.confirm());

    await waitFor(() =>
      expect(result.current.errorMessage).toBe(messages.admin.errors.selfDisable),
    );
    expect(result.current.isOpen).toBe(true);
  });

  it('forgets the reason and the error when closed', async () => {
    const onConfirm = vi.fn().mockRejectedValue(new TypeError('offline'));
    const { result } = setup(onConfirm);
    act(() => result.current.onReasonChange('spam'));
    act(() => result.current.confirm());
    await waitFor(() => expect(result.current.isPending).toBe(false));
    await waitFor(() => expect(result.current.errorMessage).not.toBeNull());

    act(() => result.current.onOpenChange(false));

    expect(result.current.reason).toBe('');
    expect(result.current.errorMessage).toBeNull();
  });
});
