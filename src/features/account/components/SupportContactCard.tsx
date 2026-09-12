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
import { supportBrand } from '../accountScreenBrands';
import { spacing, radius } from '../../../theme';

type SupportContactCardProps = {
  onHelpCenter?: () => void;
};

export function SupportContactCard({ onHelpCenter }: SupportContactCardProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Icon name="headset" size={22} color={supportBrand.onAccent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>We're here to help</Text>
          <Text style={styles.sub}>{SUPPORT_CONTACT.hours}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL(`mailto:${SUPPORT_CONTACT.email}`)}
        activeOpacity={0.85}>
        <View style={styles.iconWrap}>
          <Icon name="email-outline" size={20} color={supportBrand.accent} />
        </View>
        <View style={styles.body}>
          <Text style={styles.rowTitle}>Email</Text>
          <Text style={styles.link}>{SUPPORT_CONTACT.email}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={supportBrand.mist} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL(`tel:${SUPPORT_CONTACT.phone}`)}
        activeOpacity={0.85}>
        <View style={styles.iconWrap}>
          <Icon name="phone-outline" size={20} color={supportBrand.accent} />
        </View>
        <View style={styles.body}>
          <Text style={styles.rowTitle}>Call</Text>
          <Text style={styles.link}>{SUPPORT_CONTACT.phoneDisplay}</Text>
        </View>
        <Icon name="chevron-right" size={20} color={supportBrand.mist} />
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Icon name="map-marker-outline" size={20} color={supportBrand.accent} />
        </View>
        <View style={styles.body}>
          <Text style={styles.rowTitle}>Office</Text>
          <Text style={styles.address}>{SUPPORT_CONTACT.address}</Text>
        </View>
      </View>

      {onHelpCenter ? (
        <TouchableOpacity
          style={styles.helpBtn}
          onPress={onHelpCenter}
          activeOpacity={0.85}>
          <Icon name="help-circle-outline" size={18} color={supportBrand.onAccent} />
          <Text style={styles.helpBtnText}>Open Help Center</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: supportBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: supportBrand.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: supportBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: supportBrand.ink,
  },
  sub: {
    fontSize: 12,
    color: supportBrand.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: supportBrand.page,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: supportBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: supportBrand.ink,
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    color: supportBrand.accent,
    marginTop: 2,
  },
  address: {
    fontSize: 13,
    color: supportBrand.muted,
    marginTop: 2,
    lineHeight: 18,
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: supportBrand.accent,
    borderRadius: radius.xl,
    height: 50,
    marginTop: spacing.xs,
  },
  helpBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: supportBrand.onAccent,
  },
});
