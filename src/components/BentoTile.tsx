import React, { memo, useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

import type { IconComp } from './icons';

type Props = {
  label: string;
  Icon: IconComp;
  accent: string;
  value?: string;
  note?: string;
  height: number;
  delay?: number;
  onPress: () => void;
};

/** Claymorph tile of the Menu bento hub. Value text only when there is one. */
function BentoTileBase({ label, Icon, accent, value, note, height, delay = 0, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(enter, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [delay, enter]);

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{ flex: 1, opacity: enter, transform: [{ translateY }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.press, { height }, theme.shadow.clay]}>
        <Animated.View
          pointerEvents="box-none"
          style={[styles.fill, { height, transform: [{ scale }] }]}>
          <View style={[styles.iconWrap, { backgroundColor: accent + '22' }]}>
            <Icon size={24} color={accent} strokeWidth={2.5} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
          {value ? (
            <Text style={[styles.value, { color: accent }]} numberOfLines={1}>
              {value}
            </Text>
          ) : null}
          {note ? (
            <Text style={styles.note} numberOfLines={1}>
              {note}
            </Text>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

type PlayProps = {
  stageLabel: string;
  worldName: string;
  onPress: () => void;
};

/** The hero tile. Text CTA contains PLAY as a whole uppercase word. */
function PlayTileBase({ stageLabel, worldName, onPress }: PlayProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.015, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View pointerEvents="box-none" style={{ transform: [{ scale: pulse }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="PLAY"
        style={[styles.playPress, theme.shadow.cta]}>
        <Animated.View pointerEvents="box-none" style={[styles.playFill, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={theme.gradients.primary as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Image
            source={assets.buttonRect}
            style={[StyleSheet.absoluteFillObject, styles.playTexture]}
            resizeMode="stretch"
          />
          <Text style={styles.playLabel}>PLAY</Text>
          <Text style={styles.playNote}>{stageLabel + ' · ' + worldName}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', borderRadius: theme.radius.xl },
  fill: {
    width: '100%',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.text,
    lineHeight: 16,
  },
  value: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  note: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: theme.colors.textMuted },

  playPress: { width: '100%', height: 132, borderRadius: theme.radius.xl },
  playFill: {
    width: '100%',
    height: 132,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  playTexture: { opacity: 0.32 },
  playLabel: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: 3,
    color: theme.colors.onAccent,
  },
  playNote: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#FFE4F2',
  },
});

export const BentoTile = memo(BentoTileBase);
export const PlayTile = memo(PlayTileBase);
