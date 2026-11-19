import React, { memo, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

import type { IconComp } from './icons';

type Props = {
  title: string;
  description: string;
  Icon: IconComp;
  tint: string;
  value?: boolean;
  destructive?: boolean;
  armed?: boolean;
  onPress: () => void;
};

/** One settings row: icon + title + description + a custom switch. */
function SettingRowBase({
  title,
  description,
  Icon,
  tint,
  value,
  destructive,
  armed,
  onPress,
}: Props) {
  const knob = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(knob, {
      toValue: value ? 1 : 0,
      tension: 160,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [knob, value]);

  const translateX = knob.interpolate({ inputRange: [0, 1], outputRange: [2, 24] });
  const accent = destructive && armed ? theme.colors.danger : tint;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.row, theme.shadow.clay]}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
        <Icon size={22} color={accent} strokeWidth={2.5} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, destructive && armed ? { color: theme.colors.danger } : null]}>
          {destructive && armed ? 'TAP AGAIN TO RESET' : title}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {description}
        </Text>
      </View>
      {destructive ? (
        <View style={[styles.resetBadge, { borderColor: accent }]}>
          <Text style={[styles.resetText, { color: accent }]}>RESET</Text>
        </View>
      ) : (
        <View
          style={[
            styles.track,
            { backgroundColor: value ? theme.colors.success : theme.colors.disabled },
          ]}>
          <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text,
    lineHeight: 18,
  },
  desc: { fontSize: 11, lineHeight: 15, fontWeight: '600', color: theme.colors.textSoft },
  track: { width: 52, height: 30, borderRadius: 15, justifyContent: 'center' },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    ...theme.shadow.soft,
  },
  resetBadge: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { fontSize: 11, fontWeight: '800', letterSpacing: 1, lineHeight: 15 },
});

export const SettingRow = memo(SettingRowBase);
export default SettingRow;
