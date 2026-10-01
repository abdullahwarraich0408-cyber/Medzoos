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
import { homeBannerPalette, homeBrand } from './homeBrand';

const ACTIONS: HomeSlideAction[] = [
  'prescription',
  'doctors',
  'pharmacy',
  'labs',
  'hospitals',
];

/** Default banner wash — matches local posters (never legacy #17618E). */
export const DEFAULT_HOME_SLIDE_BG = homeBrand.bannerMid;

/** Keep API banner fills on-brand and bright (swap dark hexes for palette). */
function brightSlideBg(hex: string | undefined | null, index: number): string {
  const fallback = homeBannerPalette[index % homeBannerPalette.length];
  const raw = (hex || '').trim();
  const h = raw.startsWith('#') ? raw.slice(1) : raw;
  if (h.length !== 6 || !/^[0-9a-fA-F]+$/.test(h)) return fallback;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance < 0.48) return fallback;
  return `#${h.toLowerCase()}`;
}

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

export function mapHomeSlideDto(
  dto: HomeSlideDto,
  index = 0,
): HomePromoSlide {
  const action = ACTIONS.includes(dto.action as HomeSlideAction)
    ? (dto.action as HomeSlideAction)
    : 'doctors';
  const remote = resolveImageUrl(dto.image_url);
  return {
    id: dto.id,
    title: dto.title,
    cta: dto.cta,
    action,
    bg: brightSlideBg(dto.bg, index),
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
  return (data.slides || []).map((slide, index) =>
    mapHomeSlideDto(slide, index),
  );
}
