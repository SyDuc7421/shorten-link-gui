import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/test/utils';
import messages from '@messages/en.json';

import { useAdminGateViewModel } from '../view-models/use-admin-gate-view-model';
import { AdminGate } from './admin-gate';

vi.mock('../view-models/use-admin-gate-view-model', () => ({ useAdminGateViewModel: vi.fn() }));
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AdminGate', () => {
  it('renders the admin area only when allowed', () => {
    vi.mocked(useAdminGateViewModel).mockReturnValue({ status: 'allowed' });
    render(<AdminGate>secret</AdminGate>);
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('shows a permission state, not an alert, to a non-admin', () => {
    vi.mocked(useAdminGateViewModel).mockReturnValue({ status: 'forbidden' });
    render(<AdminGate>secret</AdminGate>);
    expect(screen.getByText(messages.admin.gate.forbiddenTitle)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('shows an error with retry when the check fails', () => {
    vi.mocked(useAdminGateViewModel).mockReturnValue({ status: 'error', retry: vi.fn() });
    render(<AdminGate>secret</AdminGate>);
    expect(screen.getByRole('alert')).toHaveTextContent(messages.admin.gate.errorTitle);
  });

  it('shows a skeleton while checking', () => {
    vi.mocked(useAdminGateViewModel).mockReturnValue({ status: 'pending' });
    const { container } = render(<AdminGate>secret</AdminGate>);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});
