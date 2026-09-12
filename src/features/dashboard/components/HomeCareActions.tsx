import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../../theme';
import { homeBrand } from '../homeBrand';
import { useContentItems } from '../hooks/useContentItems';

type CareAction = {
  id: string;
  title: string;
  subtitle: string;
  action: string;
  icon: string;
};

const SERVICE_ICON: Record<string, string> = {
  doctor: 'stethoscope',
  clinic: 'hospital-building',
  medicines: 'pill',
  labs: 'flask-outline',
  hospitals: 'domain',
  packages: 'clipboard-pulse-outline',
};

const FALLBACK: CareAction[] = [
  {
    id: 'doctor',
    title: 'Find a doctor',
    subtitle: 'Online consult',
    action: 'doctors',
    icon: SERVICE_ICON.doctor,
  },
  {
    id: 'clinic',
    title: 'Clinic visit',
    subtitle: 'Book in person',
    action: 'clinic',
    icon: SERVICE_ICON.clinic,
  },
  {
    id: 'meds',
    title: 'Order medicines',
    subtitle: 'Pharmacy',
    action: 'medicines',
    icon: SERVICE_ICON.medicines,
  },
  {
    id: 'lab',
    title: 'Book lab test',
    subtitle: 'Home or lab',
    action: 'labs',
    icon: SERVICE_ICON.labs,
  },
];

function resolveIcon(
  id: string,
  action: string,
  title = '',
  subtitle = '',
): string {
  const haystack = `${id} ${action} ${title} ${subtitle}`.toLowerCase();

  if (/(clinic|in[_\s-]?person|walk[_\s-]?in)/.test(haystack)) return SERVICE_ICON.clinic;
  if (/(lab|diagnostic|sample|flask|test[_\s-]?tube)/.test(haystack) && !/latest/.test(haystack)) {
    return SERVICE_ICON.labs;
  }
  if (/(meds|medicine|pharmacy|pill|drug|prescription)/.test(haystack)) {
    return SERVICE_ICON.medicines;
  }
  if (/(hospital|facility|facilities)/.test(haystack)) return SERVICE_ICON.hospitals;
  if (/(package|checkup|check[_\s-]?up|screening)/.test(haystack)) return SERVICE_ICON.packages;
  if (/(doctor|consult|physician|online|stethoscope|find\s*doctor)/.test(haystack)) {
    return SERVICE_ICON.doctor;
  }

  const exact = (id || action || '').toLowerCase().trim();
  return SERVICE_ICON[exact] || SERVICE_ICON.doctor;
}

/** Soft satin bands — layered translucent diagonals in brand teal */
function SatinLayers() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.satinBase} />
      <View style={[styles.satinBand, styles.satinBandA]} />
      <View style={[styles.satinBand, styles.satinBandB]} />
      <View style={[styles.satinBand, styles.satinBandC]} />
      <View style={styles.satinGlow} />
      <View style={styles.satinEdge} />
    </View>
  );
}

type HomeCareActionsProps = {
  onAction: (action: string) => void;
};

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
        icon: resolveIcon(item.id, action, title, subtitle),
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
              <SatinLayers />

              <View style={styles.cardTop}>
                <View style={styles.iconHalo}>
                  <View style={styles.iconWrap}>
                    <View style={styles.iconSatin} />
                    <Icon name={item.icon} size={22} color={homeBrand.onMain} />
                  </View>
                </View>
                <View style={styles.arrowChip}>
                  <Icon name="arrow-top-right" size={14} color={homeBrand.header} />
                </View>
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
    minHeight: 122,
    padding: 14,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(16, 85, 104, 0.18)',
    backgroundColor: '#F4FAFB',
    justifyContent: 'space-between',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: homeBrand.header,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },

  /* ——— Satin graphic effect (brand teal) ——— */
  satinBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 85, 104, 0.04)',
  },
  satinBand: {
    position: 'absolute',
    width: '160%',
    height: 34,
    left: '-30%',
    borderRadius: 20,
  },
  satinBandA: {
    top: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    transform: [{ rotate: '-18deg' }],
  },
  satinBandB: {
    top: 48,
    backgroundColor: 'rgba(16, 85, 104, 0.07)',
    transform: [{ rotate: '-18deg' }],
  },
  satinBandC: {
    top: 88,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ rotate: '-18deg' }],
  },
  satinGlow: {
    position: 'absolute',
    top: -36,
    right: -28,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(16, 85, 104, 0.1)',
  },
  satinEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  iconHalo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 85, 104, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(16, 85, 104, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: homeBrand.header,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: homeBrand.header,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  iconSatin: {
    position: 'absolute',
    top: -6,
    left: -8,
    width: 28,
    height: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    transform: [{ rotate: '-20deg' }],
  },
  arrowChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(16, 85, 104, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 3,
    zIndex: 1,
    marginTop: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: homeBrand.header,
    letterSpacing: -0.15,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: homeBrand.muted,
  },
});
