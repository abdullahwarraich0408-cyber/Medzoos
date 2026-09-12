import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { labTestsBrand } from '../../../lab-tests/labTestsBrand';
import { spacing } from '../../../../theme';

export function HomeCollectionBanner() {
  return (
    <View style={styles.banner}>
      <View style={styles.orb} />
      <View style={styles.iconWrap}>
        <Icon name="home-plus-outline" size={22} color={labTestsBrand.accent} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>Free home sample collection</Text>
        <Text style={styles.sub}>
          A certified phlebotomist visits your home. Track collection in real
          time.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md + 2,
    backgroundColor: labTestsBrand.accent,
    borderRadius: 20,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    right: -24,
    top: -28,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: labTestsBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: labTestsBrand.onAccent,
    marginBottom: 3,
  },
  sub: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.84)',
  },
});
