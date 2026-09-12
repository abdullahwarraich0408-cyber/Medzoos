import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { colors, spacing, radius, shadows } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { homeBrand } from '../homeBrand';
import { getApiBaseUrl } from '../../../config/api';
import { useContentItems } from '../hooks/useContentItems';

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

type HomeCampaignBannersProps = {
  onAction: (action: string) => void;
};

export function HomeCampaignBanners({ onAction }: HomeCampaignBannersProps) {
  const { data } = useContentItems('banners');
  const banners = (data || []).filter(item => item.title);

  if (banners.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {banners.map(banner => {
          const image = resolveImageUrl(banner.image_url);
          return (
            <Pressable
              key={banner.id}
              style={({ pressed }) => [
                styles.card,
                banner.bg ? { backgroundColor: banner.bg } : null,
                pressed && styles.pressed,
              ]}
              onPress={() => onAction(banner.action || 'doctors')}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : null}
              <View style={styles.copy}>
                {banner.badge ? (
                  <Text style={styles.badge}>{banner.badge}</Text>
                ) : null}
                <Text style={styles.title} numberOfLines={2}>
                  {banner.title}
                </Text>
                {banner.subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {banner.subtitle}
                  </Text>
                ) : null}
                {banner.cta ? (
                  <Text style={styles.cta}>{banner.cta}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -calmLayout.screenPadding,
  },
  row: {
    paddingHorizontal: calmLayout.screenPadding,
    gap: spacing.sm,
  },
  card: {
    width: 260,
    minHeight: 132,
    borderRadius: radius.lg,
    backgroundColor: homeBrand.main,
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  pressed: { opacity: 0.92 },
  image: {
    width: '100%',
    height: 88,
  },
  copy: {
    padding: 12,
    gap: 4,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
  },
  cta: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
