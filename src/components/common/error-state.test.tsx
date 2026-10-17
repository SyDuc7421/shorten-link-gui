import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

import { render, screen } from '@/test/utils';

import { ErrorState } from './error-state';
import messages from '@messages/en.json';

describe('ErrorState', () => {
  it('falls back to the translated default copy', () => {
    render(<ErrorState />);

    expect(screen.getByRole('alert')).toHaveTextContent(messages.states.errorTitle);
  });

  it('calls onRetry when the retry button is pressed', async () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    await userEvent.click(screen.getByRole('button', { name: messages.common.retry }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
