import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { SCREEN_H, SCREEN_W } from '../constants/config';
import { CANDY_COLORS } from '../constants/theme';
import { mulberry32 } from '../game/rng';

/* ------------------------- CandyRainDecor ------------------------- */

type RainProps = { count?: number; seed?: number; opacity?: number };

/** Soft candy dots drifting down behind the Loader and the Menu. */
function CandyRainDecorBase({ count = 14, seed = 4744, opacity = 1 }: RainProps) {
  const drift = useRef(new Animated.Value(0)).current;

  const dots = useMemo(() => {
    const rng = mulberry32(seed);
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push({
        cx: rng() * SCREEN_W,
        cy: rng() * SCREEN_H * 0.92,
        r: 6 + rng() * 12,
        fill: CANDY_COLORS[Math.floor(rng() * CANDY_COLORS.length) % CANDY_COLORS.length],
        o: 0.16 + rng() * 0.14,
      });
    }
    return out;
  }, [count, seed]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { opacity, transform: [{ translateY }] }]}>
      <Svg width={SCREEN_W} height={SCREEN_H}>
        {dots.map((d, i) => (
          <Circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} opacity={d.o} />
        ))}
      </Svg>
    </Animated.View>
  );
}

/* ------------------------- BlobDecor ------------------------- */

function BlobDecorBase({ a = '#FF69B4', b = '#5FD3A6' }: { a?: string; b?: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Svg width={SCREEN_W} height={SCREEN_H}>
        <Circle cx={SCREEN_W - 40} cy={110} r={150} fill={a} opacity={0.1} />
        <Circle cx={30} cy={SCREEN_H - 120} r={120} fill={b} opacity={0.08} />
      </Svg>
    </View>
  );
}

/* ------------------------- ConfettiLayer ------------------------- */

/** SVG confetti - never emoji, never an asset. Off when Gentle Motion is on. */
function ConfettiLayerBase({ active }: { active: boolean }) {
  const fall = useRef(new Animated.Value(0)).current;

  const bits = useMemo(() => {
    const rng = mulberry32(90210);
    const out = [];
    for (let i = 0; i < 18; i++) {
      out.push({
        x: rng() * (SCREEN_W - 16),
        y: rng() * 180,
        w: 6 + rng() * 6,
        h: 10 + rng() * 8,
        fill: CANDY_COLORS[Math.floor(rng() * CANDY_COLORS.length) % CANDY_COLORS.length],
      });
    }
    return out;
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    fall.setValue(0);
    const anim = Animated.timing(fall, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [active, fall]);

  if (!active) return null;

  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-60, SCREEN_H * 0.7] });
  const opacity = fall.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { opacity, transform: [{ translateY }] }]}>
      <Svg width={SCREEN_W} height={SCREEN_H}>
        {bits.map((b, i) => (
          <Rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={2} fill={b.fill} opacity={0.9} />
        ))}
      </Svg>
    </Animated.View>
  );
}

export const CandyRainDecor = memo(CandyRainDecorBase);
export const BlobDecor = memo(BlobDecorBase);
export const ConfettiLayer = memo(ConfettiLayerBase);
