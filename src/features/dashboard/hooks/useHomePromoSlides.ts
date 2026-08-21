import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiBaseUrl } from '../../../config/api';
import { homeSlidesApi, type HomeSlideAudience, type HomeSlideDto } from '../../../lib/api';
import {
  HOME_HERO_SLIDES,
  HOME_OFFER_SLIDES,
  fallbackImageForAction,
  type HomePromoSlide,
  type HomeSlideAction,
} from '../../home/data/homeData';
import {
  hasSeenHomePosters,
  markHomePostersSeen,
} from '../../home/homeVisitStorage';

const ACTIONS: HomeSlideAction[] = [
  'prescription',
  'doctors',
  'pharmacy',
  'labs',
  'hospitals',
];

function resolveImageUrl(value?: string | null) {
  const url = value?.trim();
  if (!url) return null;
  if (
    url.startsWith('https://') ||
    url.startsWith('http://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  if (url.startsWith('/')) {
    const base = String(getApiBaseUrl() || '').replace(/\/api\/?$/, '');
    return base ? `${base}${url}` : url;
  }
  return url;
}

function mapSlide(dto: HomeSlideDto): HomePromoSlide {
  const action = ACTIONS.includes(dto.action as HomeSlideAction)
    ? (dto.action as HomeSlideAction)
    : 'doctors';
  const remote = resolveImageUrl(dto.image_url);
  return {
    id: dto.id,
    title: dto.title,
    cta: dto.cta,
    action,
    bg: dto.bg || '#17618E',
    label: dto.label || undefined,
    description: dto.description || undefined,
    badge: dto.badge || undefined,
    image: remote ? { uri: remote } : fallbackImageForAction(action),
  };
}

export function useHomePromoSlides() {
  const [audience, setAudience] = useState<HomeSlideAudience | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const seen = await hasSeenHomePosters();
      if (cancelled) return;
      const next: HomeSlideAudience = seen ? 'returning' : 'first_visit';
      setAudience(next);
      if (!seen) {
        await markHomePostersSeen();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const query = useQuery({
    queryKey: ['home-slides', audience],
    enabled: Boolean(audience),
    queryFn: async () => {
      const data = await homeSlidesApi.list(audience as HomeSlideAudience);
      return (data.slides || []).map(mapSlide);
    },
    staleTime: 5 * 60 * 1000,
  });

  const fallbacks =
    audience === 'returning' ? HOME_OFFER_SLIDES : HOME_HERO_SLIDES;

  const slides = useMemo(() => {
    if (!audience) return [];
    if (query.data && query.data.length > 0) return query.data;
    return fallbacks;
  }, [audience, query.data, fallbacks]);

  return {
    audience,
    slides,
    isLoading: !audience,
    refetch: query.refetch,
  };
}
