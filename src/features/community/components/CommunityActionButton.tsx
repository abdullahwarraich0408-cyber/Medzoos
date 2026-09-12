import React from 'react';
import { Pressable, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing } from '../../../theme';
import { communityBrand } from '../communityBrand';

type CommunityActionButtonProps = {
  label: string;
  onPress: () => void;
  icon?: string;
};

export function CommunityActionButton({
  label,
  onPress,
  icon = 'plus',
}: CommunityActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      onPress={onPress}>
      <Icon name={icon} size={18} color={communityBrand.onAccent} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: communityBrand.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: communityBrand.accentDeep,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  btnPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  text: {
    fontSize: 14,
    fontWeight: '700',
    color: communityBrand.onAccent,
  },
});
