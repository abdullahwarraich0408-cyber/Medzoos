import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SUPPORT_CONTACT } from '../data/accountData';


type SupportContactCardProps = {
  onHelpCenter?: () => void;
};

export function SupportContactCard({ onHelpCenter }: SupportContactCardProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>We're here to help</Text>
      <Text style={styles.sub}>{SUPPORT_CONTACT.hours}</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL(`mailto:${SUPPORT_CONTACT.email}`)}
        activeOpacity={0.85}>
        <View style={styles.iconWrap}>
          <Icon name="email-outline" size={22} color={colors.brandPrimary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.rowTitle}>Email Us</Text>
          <Text style={styles.rowSub}>General inquiries and support</Text>
          <Text style={styles.link}>{SUPPORT_CONTACT.email}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL(`tel:${SUPPORT_CONTACT.phone}`)}
        activeOpacity={0.85}>
        <View style={styles.iconWrap}>
          <Icon name="phone-outline" size={22} color={colors.brandPrimary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.rowTitle}>Call Us</Text>
          <Text style={styles.rowSub}>Mon–Fri 9am–6pm</Text>
          <Text style={styles.link}>{SUPPORT_CONTACT.phoneDisplay}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Icon name="map-marker-outline" size={22} color={colors.brandPrimary} />
        </View>
        <View style={styles.body}>
          <Text style={styles.rowTitle}>Office</Text>
          <Text style={styles.address}>{SUPPORT_CONTACT.address}</Text>
        </View>
      </View>

      {onHelpCenter ? (
        <TouchableOpacity style={styles.helpBtn} onPress={onHelpCenter} activeOpacity={0.85}>
          <Icon name="help-circle-outline" size={18} color={colors.white} />
          <Text style={styles.helpBtnText}>Open Help Center</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  sub: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  rowSub: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brandPrimary,
    marginTop: 4,
  },
  address: {
    fontSize: 14,
    color: colors.neutral600,
    marginTop: 4,
    lineHeight: 20,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    height: 48,
    marginTop: spacing.sm,
  },
  helpBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});