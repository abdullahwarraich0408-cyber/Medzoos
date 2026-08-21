import { useQuery } from '@tanstack/react-query';
import { contentApi, type ContentItemDto } from '../../../lib/api';

export function useContentItems(section: string) {
  return useQuery({
    queryKey: ['content', section, 'app'],
    queryFn: async () => {
      const data = await contentApi.list(section, 'app');
      return (data.items || []).filter(item => item.section === section);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export type { ContentItemDto };
