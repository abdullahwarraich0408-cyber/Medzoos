import { useEffect, useMemo, useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { HomeSlideAudience } from '../../../lib/api';
import {
  fetchHomePromoSlides,
  homeSlidesQueryKey,
  localHomeSlides,
  resolveHomeSlideAudience,
} from '../homeSlides';

export function useHomePromoSlides() {
  const [audience, setAudience] = useState<HomeSlideAudience | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveHomeSlideAudience().then(next => {
      if (!cancelled) setAudience(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const query = useQuery({
    queryKey: homeSlidesQueryKey(audience ?? 'returning'),
    enabled: Boolean(audience),
    queryFn: () => fetchHomePromoSlides(audience as HomeSlideAudience),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    // Prefetch seeds cache; this keeps local posters if cache empty mid-flight.
    initialData: () =>
      audience ? localHomeSlides(audience) : undefined,
    initialDataUpdatedAt: 0,
  });

  const fallbacks = audience ? localHomeSlides(audience) : [];

  const slides = useMemo(() => {
    if (!audience) {
      // Brief moment before AsyncStorage audience resolves — use returning posters
      // so Home never flashes an empty carousel on cold start.
      return localHomeSlides('returning');
    }
    if (query.data && query.data.length > 0) {
      return query.data;
    }
    return fallbacks;
  }, [audience, query.data, fallbacks]);

  return {
    audience,
    slides,
    isLoading: false,
    refetch: query.refetch,
  };
}
