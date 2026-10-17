import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

process.env.NEXT_PUBLIC_APP_URL ??= 'http://localhost:3000';
process.env.NEXT_PUBLIC_API_URL ??= 'http://localhost:8080';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
