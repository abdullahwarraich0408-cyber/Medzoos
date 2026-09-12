import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackBackButton } from '../../../components/navigation/StackBackButton';
import { appBrand, stackScreenTitleStyle } from '../../../theme/appBrand';
import { spacing } from '../../../theme';
import {
  getStackHeaderTopInset,
  STACK_HEADER_ROW_PAD_V,
} from '../../../theme/layout';

type DoctorsScreenHeaderProps = {
  title?: string;
  onBackPress: () => void;
  showBack?: boolean;
};

/**
 * Matches Pharmacies / TopNavigation stack header spacing exactly.
 */
export function DoctorsScreenHeader({
  title = 'Doctors',
  onBackPress,
  showBack = true,
}: DoctorsScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const topInset = getStackHeaderTopInset(insets.top);

  return (
    <View style={[styles.shell, { paddingTop: topInset }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.row}>
        {showBack ? (
          <StackBackButton onPress={onBackPress} />
        ) : (
          <View style={styles.sideSlot} />
        )}

        <View style={styles.titleBlock} pointerEvents="none">
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.sideSlot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: appBrand.page,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: STACK_HEADER_ROW_PAD_V,
    minHeight: 44,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  title: {
    ...stackScreenTitleStyle,
  },
  sideSlot: {
    width: 44,
    height: 44,
  },
});
