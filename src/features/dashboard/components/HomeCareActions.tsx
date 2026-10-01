import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  type ImageSourcePropType,
} from 'react-native';
import { spacing } from '../../../theme';
import { homeBrand } from '../homeBrand';
import { useContentItems } from '../hooks/useContentItems';

type CareAction = {
  id: string;
  title: string;
  subtitle: string;
  action: string;
  image: ImageSourcePropType;
  remoteImage?: string;
  badge?: string;
};

const IMG = {
  doctor: require('../../../assets/home/hero-consult-doctor.png'),
  clinic: require('../../../assets/onboarding/onboarding-doctor.png'),
  medicines: require('../../../assets/home/hero-buy-medicine.png'),
  labs: require('../../../assets/home/hero-lab-test.png'),
  hospitals: require('../../../assets/home/poster-3d-stethoscope.png'),
  packages: require('../../../assets/home/poster-3d-prescription.png'),
} as const;

const FALLBACK: CareAction[] = [
  {
    id: 'doctor',
    title: 'Find doctor',
    subtitle: 'Online consult',
    action: 'doctors',
    image: IMG.doctor,
  },
  {
    id: 'clinic',
    title: 'Clinic visit',
    subtitle: 'Book in person',
    action: 'clinic',
    image: IMG.clinic,
  },
  {
    id: 'meds',
    title: 'Pharmacy',
    subtitle: 'Order medicines',
    action: 'medicines',
    image: IMG.medicines,
  },
  {
    id: 'lab',
    title: 'Lab tests',
    subtitle: 'Home sampling',
    action: 'labs',
    image: IMG.labs,
  },
];

function resolveLocalImage(
  id: string,
  action: string,
  title = '',
  subtitle = '',
): ImageSourcePropType {
  const haystack = `${id} ${action} ${title} ${subtitle}`.toLowerCase();

  if (/(clinic|in[_\s-]?person|walk[_\s-]?in)/.test(haystack)) return IMG.clinic;
  if (
    /(lab|diagnostic|sample|flask|test[_\s-]?tube)/.test(haystack) &&
    !/latest/.test(haystack)
  ) {
    return IMG.labs;
  }
  if (/(meds|medicine|pharmacy|pill|drug|prescription)/.test(haystack)) {
    return IMG.medicines;
  }
  if (/(hospital|facility|facilities)/.test(haystack)) return IMG.hospitals;
  if (/(package|checkup|check[_\s-]?up|screening)/.test(haystack)) {
    return IMG.packages;
  }
  if (/(doctor|consult|physician|online|stethoscope|find\s*doctor)/.test(haystack)) {
    return IMG.doctor;
  }

  const exact = (id || action || '').toLowerCase().trim();
  if (exact in IMG) return IMG[exact as keyof typeof IMG];
  return IMG.doctor;
}

type HomeCareActionsProps = {
  onAction: (action: string) => void;
};

/**
 * Image-led 2×2 service hero — Apna Clinic-style cards, Medzoos teal branding.
 */
export function HomeCareActions({ onAction }: HomeCareActionsProps) {
  const { data } = useContentItems('care_actions');

  const actions = useMemo((): CareAction[] => {
    if (!data || data.length === 0) return FALLBACK;

    return data.slice(0, 4).map(item => {
      const action = item.action || 'doctors';
      const title = item.title || '';
      const subtitle = item.subtitle || '';
      return {
        id: item.id,
        title,
        subtitle,
        action,
        image: resolveLocalImage(item.id, action, title, subtitle),
        remoteImage: item.image_url || undefined,
        badge: item.badge || undefined,
      };
    });
  }, [data]);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.heading}>Healthcare Services</Text>
        <Text style={styles.subheading}>Care options tailored for you</Text>
      </View>

      <View style={styles.grid}>
        {actions.map(item => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.cardPress, pressed && styles.pressed]}
            onPress={() => onAction(item.action)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.subtitle}`}>
            <View style={styles.card}>
              <View style={styles.imageFrame}>
                <Image
                  source={
                    item.remoteImage ? { uri: item.remoteImage } : item.image
                  }
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.imageScrim} />
                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText} numberOfLines={1}>
                      {item.badge}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.copy}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  header: {
    gap: 2,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: homeBrand.header,
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: 12,
    fontWeight: '500',
    color: homeBrand.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardPress: {
    width: '48.1%',
  },
  card: {
    borderRadius: 18,
    backgroundColor: homeBrand.page,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: homeBrand.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#10233F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  imageFrame: {
    height: 118,
    backgroundColor: homeBrand.soft,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 61, 66, 0.06)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: '78%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: homeBrand.main,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: homeBrand.onMain,
    letterSpacing: 0.1,
  },
  copy: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: homeBrand.header,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: homeBrand.muted,
    textAlign: 'center',
  },
});
