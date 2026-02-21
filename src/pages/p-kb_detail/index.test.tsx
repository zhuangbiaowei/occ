import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { useAuthStore } from '../../lib/auth';
import KnowledgeBaseDetailPage from './index';

const apiBaseUrl = 'http://localhost:3000';

describe('KnowledgeBaseDetailPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'test-token',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads knowledge base documents from the API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'doc-1',
            title: '数据库文档',
            tags: [{ name: '合规' }],
            createdBy: { fullName: '管理员' },
            createdAt: '2024-01-05T10:00:00.000Z',
            mimeType: 'application/pdf',
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <MemoryRouter initialEntries={['/kb-detail?kbId=kb-1']}>
        <KnowledgeBaseDetailPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('数据库文档')).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${apiBaseUrl}/api/v1/knowledge-bases/kb-1/documents`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
