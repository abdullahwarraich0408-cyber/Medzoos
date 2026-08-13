import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HEALTH_RECORD_LINKS } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { colors, spacing, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type HealthRecordsListProps = {
  navigation: NativeStackNavigationProp<HealthStackParamList>;
};

export function HealthRecordsList({ navigation }: HealthRecordsListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Health records</Text>
      <View style={styles.card}>
        {HEALTH_RECORD_LINKS.map((link, index) => (
          <React.Fragment key={link.id}>
            {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate(link.screen)}>
              <Text style={styles.title}>{link.title}</Text>
              <View style={cardStyles.chevronWrap}>
                <Icon name="chevron-right" size={18} color={colors.neutral500} />
              </View>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  card: {
    ...cardStyles.grouped,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.brandMist },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    flex: 1,
  },
});
