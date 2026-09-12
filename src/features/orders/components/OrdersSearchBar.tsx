import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ordersBrand } from '../ordersBrand';
import { spacing, radius } from '../../../theme';

type OrdersSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function OrdersSearchBar({
  value,
  onChangeText,
  placeholder = 'Search orders...',
}: OrdersSearchBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWell}>
        <Icon name="magnify" size={18} color={ordersBrand.accent} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={ordersBrand.muted}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: ordersBrand.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: ordersBrand.border,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  iconWell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ordersBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: ordersBrand.ink,
    paddingVertical: 0,
  },
});
