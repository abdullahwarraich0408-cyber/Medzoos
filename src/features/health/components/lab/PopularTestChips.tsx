import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { labTestsBrand } from '../../../lab-tests/labTestsBrand';
import { radius } from '../../../../theme';

type PopularTestChipsProps = {
  tests: Array<{ id: string; label: string }>;
  activeId?: string | null;
  onSelect: (query: string, id: string) => void;
};

const CHIP_ICONS: Record<string, string> = {
  cbc: 'water',
  hba1c: 'needle',
  'vitamin-d': 'pill',
  'vitamin d': 'pill',
  lipid: 'heart-pulse',
  'lipid profile': 'heart-pulse',
};

function iconFor(id: string, label: string) {
  const key = (id || label).toLowerCase();
  for (const [match, icon] of Object.entries(CHIP_ICONS)) {
    if (key.includes(match)) return icon;
  }
  return 'flask-outline';
}

export function PopularTestChips({
  tests,
  activeId,
  onSelect,
}: PopularTestChipsProps) {
  return (
    <View style={styles.rail}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {tests.map(test => {
          const active = activeId === test.id;
          return (
            <TouchableOpacity
              key={test.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSelect(test.label, test.id)}
              activeOpacity={0.85}>
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <Icon
                  name={iconFor(test.id, test.label)}
                  size={13}
                  color={
                    active ? labTestsBrand.accent : labTestsBrand.onAccent
                  }
                />
              </View>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {test.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    backgroundColor: labTestsBrand.soft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  row: {
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: labTestsBrand.card,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    ...Platform.select({
      ios: {
        shadowColor: labTestsBrand.ink,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  chipActive: {
    backgroundColor: labTestsBrand.accent,
    borderColor: labTestsBrand.accent,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: labTestsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: labTestsBrand.card,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: labTestsBrand.ink,
  },
  chipTextActive: { color: labTestsBrand.onAccent },
});
