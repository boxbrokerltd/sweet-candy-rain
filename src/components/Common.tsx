import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../constants/theme';
import { ratio } from '../utils/format';

import type { IconComp } from './icons';

/* ------------------------- ProgressBar ------------------------- */

type BarProps = {
  value: number;
  max: number;
  colors?: string[];
  height?: number;
  track?: string;
};

/** Width is never animated - the fill is driven by scaleX on the native driver. */
function ProgressBarBase({ value, max, colors, height = 8, track }: BarProps) {
  const pct = ratio(value, max);
  const anim = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [anim, pct]);

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: track || theme.colors.border },
      ]}>
      <Animated.View
        style={[
          styles.fillWrap,
          { height, borderRadius: height / 2, transform: [{ scaleX: anim }] },
        ]}>
        <LinearGradient
          colors={colors || (theme.gradients.rain as unknown as string[])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { height, borderRadius: height / 2 }]}
        />
      </Animated.View>
    </View>
  );
}

/* ------------------------- EmptyState ------------------------- */

function EmptyStateBase({ Icon, message }: { Icon: IconComp; message: string }) {
  return (
    <View style={styles.empty}>
      <Icon size={40} color={theme.colors.disabled} strokeWidth={2} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

/* ------------------------- Pill ------------------------- */

type PillProps = { Icon: IconComp; value: string; tone?: string };

function PillBase({ Icon, value, tone = theme.colors.secondary }: PillProps) {
  return (
    <View style={styles.pill}>
      <Icon size={16} color={tone} strokeWidth={2.6} />
      <Text style={[styles.pillValue, { color: tone }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/* ------------------------- ClayCard ------------------------- */

function ClayCardBase({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.clay, style]} pointerEvents="box-none">
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fillWrap: { width: '100%', transformOrigin: 'left' as any, alignSelf: 'flex-start' },
  fill: { width: '100%' },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.colors.textSoft,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 32,
    minWidth: 48,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.soft,
  },
  pillValue: { fontSize: 13, fontWeight: '800', letterSpacing: 0.4, lineHeight: 16 },
  clay: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopColor: 'rgba(255,255,255,0.9)',
    ...theme.shadow.clay,
  },
});

export const ProgressBar = memo(ProgressBarBase);
export const EmptyState = memo(EmptyStateBase);
export const Pill = memo(PillBase);
export const ClayCard = memo(ClayCardBase);
