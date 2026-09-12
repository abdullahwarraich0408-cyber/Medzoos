import { getApiBaseUrl } from '../../config/api';
import { homeSlidesApi, type HomeSlideAudience, type HomeSlideDto } from '../../lib/api';
import {
  HOME_HERO_SLIDES,
  HOME_OFFER_SLIDES,
  fallbackImageForAction,
  type HomePromoSlide,
  type HomeSlideAction,
} from '../home/data/homeData';
import {
  hasSeenHomePosters,
  markHomePostersSeen,
} from '../home/homeVisitStorage';
import { homeBrand } from './homeBrand';

const ACTIONS: HomeSlideAction[] = [
  'prescription',
  'doctors',
  'pharmacy',
  'labs',
  'hospitals',
];

/** Default banner wash — matches local posters (never legacy #17618E). */
export const DEFAULT_HOME_SLIDE_BG = homeBrand.bannerMid;

/** One resolution per process so splash prefetch and Home share the same cache key. */
let audiencePromise: Promise<HomeSlideAudience> | null = null;

export function resolveHomeSlideAudience(): Promise<HomeSlideAudience> {
  if (!audiencePromise) {
    audiencePromise = (async () => {
      const seen = await hasSeenHomePosters();
      if (!seen) {
        await markHomePostersSeen();
        return 'first_visit';
      }
      return 'returning';
    })();
  }
  return audiencePromise;
}

export function homeSlidesQueryKey(audience: HomeSlideAudience) {
  return ['home-slides', audience] as const;
}

export function localHomeSlides(audience: HomeSlideAudience): HomePromoSlide[] {
  return audience === 'returning' ? HOME_OFFER_SLIDES : HOME_HERO_SLIDES;
}

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

export function mapHomeSlideDto(dto: HomeSlideDto): HomePromoSlide {
  const action = ACTIONS.includes(dto.action as HomeSlideAction)
    ? (dto.action as HomeSlideAction)
    : 'doctors';
  const remote = resolveImageUrl(dto.image_url);
  return {
    id: dto.id,
    title: dto.title,
    cta: dto.cta,
    action,
    bg: dto.bg || DEFAULT_HOME_SLIDE_BG,
    label: dto.label || undefined,
    description: dto.description || undefined,
    badge: dto.badge || undefined,
    image: remote ? { uri: remote } : fallbackImageForAction(action),
  };
}

export async function fetchHomePromoSlides(
  audience: HomeSlideAudience,
): Promise<HomePromoSlide[]> {
  const data = await homeSlidesApi.list(audience);
  return (data.slides || []).map(mapHomeSlideDto);
}
