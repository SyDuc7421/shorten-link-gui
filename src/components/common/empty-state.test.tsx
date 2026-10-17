import { describe, expect, it } from 'vitest';

import { render, screen } from '@/test/utils';

import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('shows the title and the guidance text', () => {
    render(<EmptyState title="No projects yet" description="Create your first project." />);

    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first project.')).toBeInTheDocument();
  });
});
