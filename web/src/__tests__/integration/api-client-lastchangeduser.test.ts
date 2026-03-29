/**
 * Integration Tests: LastChangedUser header on mutating API calls
 *
 * Epic 1, Story 2 — AC-8
 * Verifies that post(), put(), and del() include the LastChangedUser
 * header when a user identity is provided.
 */

import { vi, beforeEach, describe, it, expect } from 'vitest';
import { post, put, del } from '@/lib/api/client';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LastChangedUser header (Epic 1, Story 2, AC-8)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('includes LastChangedUser header on POST requests', async () => {
    await post('/v1/test', { data: 'value' }, 'operator@example.com');

    const [, config] = mockFetch.mock.calls[0];
    expect(config.headers).toHaveProperty(
      'LastChangedUser',
      'operator@example.com',
    );
  });

  it('includes LastChangedUser header on PUT requests', async () => {
    await put('/v1/test', { data: 'value' }, 'operator@example.com');

    const [, config] = mockFetch.mock.calls[0];
    expect(config.headers).toHaveProperty(
      'LastChangedUser',
      'operator@example.com',
    );
  });

  it('includes LastChangedUser header on DELETE requests', async () => {
    await del('/v1/test', 'operator@example.com');

    const [, config] = mockFetch.mock.calls[0];
    expect(config.headers).toHaveProperty(
      'LastChangedUser',
      'operator@example.com',
    );
  });

  it('does not include LastChangedUser header when no user is provided', async () => {
    await post('/v1/test', { data: 'value' });

    const [, config] = mockFetch.mock.calls[0];
    expect(config.headers).not.toHaveProperty('LastChangedUser');
  });
});
