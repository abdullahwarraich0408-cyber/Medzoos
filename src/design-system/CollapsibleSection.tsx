import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../theme';
import { healthOsTypography } from '../theme/healthOs';

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

/** Secondary content — hidden until user expands */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.header} onPress={() => setOpen(v => !v)}>
        <Text style={styles.title}>{title}</Text>
        <Icon
          name={open ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={colors.neutral500}
        />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  title: {
    ...healthOsTypography.sectionTitle,
    color: colors.neutral600,
    fontSize: 15,
  },
  body: { gap: spacing.sm },
});
