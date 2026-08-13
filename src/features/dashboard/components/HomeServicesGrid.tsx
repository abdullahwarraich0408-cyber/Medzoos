import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SERVICE_CARDS } from '../../home/data/homeData';
import { colors, spacing, radius, cardStyles, pastelTileStyle, iconTileStyle, arrowChipStyle, appIcons } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type HomeServicesGridProps = {
  onPressService: (card: (typeof SERVICE_CARDS)[number]) => void;
};

function chunkCards<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export function HomeServicesGrid({ onPressService }: HomeServicesGridProps) {
  const rows = chunkCards(SERVICE_CARDS, 2);

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(card => (
            <Pressable
              key={card.id}
              style={({ pressed }) => [
                styles.tile,
                pastelTileStyle(card.bg),
                pressed && cardStyles.pressed,
              ]}
              onPress={() => onPressService(card)}>
              <View style={styles.topRow}>
                <View style={iconTileStyle()}>
                  <Icon name={card.icon} size={appIcons.size.lg} color={appIcons.color} />
                </View>
                <View style={arrowChipStyle()}>
                  <Icon name="arrow-top-right" size={14} color={appIcons.color} />
                </View>
              </View>
              <Text style={styles.title}>{card.title}</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {card.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    padding: spacing.md,
    minHeight: 122,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    marginBottom: 2,
  },
  subtitle: {
    ...healthOsTypography.messageCaption,
    fontSize: 12,
    lineHeight: 16,
    color: colors.neutral600,
  },
});
