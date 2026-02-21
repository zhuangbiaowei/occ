import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { useAuthStore } from '../../lib/auth';
import KnowledgeBaseListPage from './index';

const apiBaseUrl = 'http://localhost:3000';

describe('KnowledgeBaseListPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: 'test-token',
    });
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads knowledge bases from the API and renders them', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'kb-1',
            name: '测试知识库',
            description: '用于测试',
            updatedAt: '2024-01-02T10:00:00.000Z',
            documents: [],
            createdBy: { fullName: '管理员' },
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <MemoryRouter>
        <KnowledgeBaseListPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('测试知识库')).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `${apiBaseUrl}/api/v1/knowledge-bases`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  it('posts a new knowledge base and adds it to the list', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'kb-2',
          name: '新知识库',
          description: '描述内容',
          updatedAt: '2024-01-03T09:00:00.000Z',
          documents: [],
          createdBy: { fullName: '管理员' },
        }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <MemoryRouter>
        <KnowledgeBaseListPage />
      </MemoryRouter>
    );

    await screen.findAllByText('知识库管理');
    await user.click(screen.getByRole('button', { name: '新建知识库' }));
    await user.type(screen.getByLabelText(/知识库名称/), '新知识库');
    await user.type(screen.getByLabelText('描述'), '描述内容');
    await user.click(screen.getByRole('button', { name: '创建' }));

    expect(await screen.findByText('新知识库')).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        `${apiBaseUrl}/api/v1/knowledge-bases`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({
            name: '新知识库',
            description: '描述内容',
          }),
        })
      );
    });
  });

  it('deletes a knowledge base through the API and removes it from the list', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'kb-delete',
              name: '待删除知识库',
              description: '即将删除',
              updatedAt: '2024-01-04T08:00:00.000Z',
              documents: [],
              createdBy: { fullName: '管理员' },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'deleted' }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(
      <MemoryRouter>
        <KnowledgeBaseListPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('待删除知识库')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /删除知识库/ }));
    await user.click(screen.getByRole('button', { name: '删除' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        `${apiBaseUrl}/api/v1/knowledge-bases/kb-delete`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
    await waitFor(() => {
      expect(screen.queryByText('待删除知识库')).not.toBeInTheDocument();
    });
  });
});
