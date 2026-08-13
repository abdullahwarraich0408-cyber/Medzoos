import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


type LabTestsHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function LabTestsHero({ search, onSearchChange }: LabTestsHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.iconWrap}>
        <Icon name="flask" size={28} color={colors.brandPrimary} />
      </View>
      <Text style={styles.title}>Lab Tests & Health Packages</Text>
      <Text style={styles.subtitle}>
        Accurate, fast, and reliable — sample pickup at your home.
      </Text>
      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color={colors.brandPrimary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tests, labs, categories..."
          placeholderTextColor={colors.neutral500}
          value={search}
          onChangeText={onSearchChange}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Icon
            name="close-circle"
            size={18}
            color={colors.neutral500}
            onPress={() => onSearchChange('')}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: spacing.xs,
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral100,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.inkHeadline,
    padding: 0,
  },
});