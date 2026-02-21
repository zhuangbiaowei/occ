import { QueryClient } from '@tanstack/react-query';

// 创建 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存时间 5 分钟
      staleTime: 5 * 60 * 1000,
      // 重试次数
      retry: 1,
      // 重试延迟
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 错误处理
      throwOnError: false,
    },
    mutations: {
      // 错误处理
      throwOnError: false,
    },
  },
});
