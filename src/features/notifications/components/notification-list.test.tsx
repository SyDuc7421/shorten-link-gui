import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/test/utils';
import messages from '@messages/en.json';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../model/notifications-api';
import type { Notification } from '../model/types';
import { NotificationList } from './notification-list';

vi.mock('../model/notifications-api', () => ({
  useNotifications: vi.fn(),
  useMarkNotificationRead: vi.fn(),
  useMarkAllNotificationsRead: vi.fn(),
}));
vi.mock('@/i18n/navigation', () => ({
  Link: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode } & React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const t = messages.notifications;

const passwordChanged: Notification = {
  id: '3',
  type: 'password_changed',
  link_id: null,
  code: null,
  expires_at: null,
  read_at: null,
  created_at: '2026-11-03T00:00:00Z',
};
const disabled: Notification = {
  id: '2',
  type: 'link_disabled',
  link_id: '734000000000000001',
  code: 'abc',
  expires_at: null,
  read_at: '2026-11-03T01:00:00Z',
  created_at: '2026-11-02T00:00:00Z',
};

const markRead = vi.fn();

function mockList(overrides: Record<string, unknown>) {
  vi.mocked(useNotifications).mockReturnValue({
    data: undefined,
    status: 'success',
    refetch: vi.fn(),
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isRefetching: false,
    ...overrides,
  } as unknown as ReturnType<typeof useNotifications>);
}

function mockItems(items: Notification[], unread: number) {
  mockList({ data: { pages: [{ items, unread_count: unread }] } });
}

describe('NotificationList', () => {
  beforeEach(() => {
    markRead.mockReset();
    vi.mocked(useMarkNotificationRead).mockReturnValue({
      mutate: markRead,
    } as unknown as ReturnType<typeof useMarkNotificationRead>);
    vi.mocked(useMarkAllNotificationsRead).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMarkAllNotificationsRead>);
  });

  it('shows password_changed as a button with no link and no empty placeholders', () => {
    mockItems([passwordChanged], 1);
    const { container } = render(<NotificationList onDone={vi.fn()} />);
    expect(screen.getByRole('button', { name: new RegExp(t.passwordChanged) })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container).not.toHaveTextContent(/null|undefined/);
  });

  it('links a link notification to the dashboard with its code', () => {
    mockItems([disabled], 0);
    render(<NotificationList onDone={vi.fn()} />);
    const link = screen.getByRole('link', { name: /abc/ });
    expect(link).toHaveAttribute('href', '/');
  });

  it('marks only unread items with the Unread text', () => {
    mockItems([passwordChanged, disabled], 1);
    render(<NotificationList onDone={vi.fn()} />);
    expect(screen.getAllByText(t.unread)).toHaveLength(1);
  });

  it('marks an unread item read and reports done when it is selected', async () => {
    const onDone = vi.fn();
    mockItems([passwordChanged], 1);
    render(<NotificationList onDone={onDone} />);
    await userEvent.click(screen.getByRole('button', { name: new RegExp(t.passwordChanged) }));
    expect(markRead).toHaveBeenCalledWith('3');
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('offers mark all as read only when something is unread', () => {
    mockItems([passwordChanged], 1);
    const { unmount } = render(<NotificationList onDone={vi.fn()} />);
    expect(screen.getByRole('button', { name: t.markAllRead })).toBeInTheDocument();
    unmount();

    mockItems([disabled], 0);
    render(<NotificationList onDone={vi.fn()} />);
    expect(screen.queryByRole('button', { name: t.markAllRead })).not.toBeInTheDocument();
  });

  it('shows an error state with retry when the first load fails', () => {
    mockList({ status: 'error' });
    render(<NotificationList onDone={vi.fn()} />);
    expect(screen.getByText(t.loadErrorTitle)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.common.retry })).toBeInTheDocument();
  });

  it('shows the empty state', () => {
    mockItems([], 0);
    render(<NotificationList onDone={vi.fn()} />);
    expect(screen.getByText(t.emptyTitle)).toBeInTheDocument();
  });
});
