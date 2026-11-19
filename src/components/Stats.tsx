import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { formatScore } from '../utils/format';

export type StatItem = { value: number; label: string; accent: string };

type CardProps = { value: number; label: string; accent: string };

/**
 * One stat card used on Result, Missions and Collection alike.
 * No sprites, no emoji: an accent dot carries the semantics, the number is big.
 * Renders null when there is nothing to show.
 */
function StatCardBase({ value, label, accent }: CardProps) {
  if (value <= 0) return null;
  return (
    <View style={[styles.card, { borderColor: accent + '55' }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
        {formatScore(value)}
      </Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** A lone pill looks orphaned - a row needs at least two live values. */
function StatRowBase({ items }: { items: StatItem[] }) {
  const visible = items.filter(i => i.value > 0);
  if (visible.length < 2) return null;
  return (
    <View style={styles.row}>
      {visible.map(item => (
        <View key={item.label} style={styles.slot}>
          <StatCardBase value={item.value} label={item.label} accent={item.accent} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16 },
  slot: { flex: 1 },
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.9)',
    ...theme.shadow.clay,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  value: { fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  label: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.textSoft,
  },
});

export const StatCard = memo(StatCardBase);
export const StatRow = memo(StatRowBase);
