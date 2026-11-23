import React, { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { NodeState } from '../game/progression';
import { usePressScale } from '../hooks/usePressScale';
import { Lock } from './icons';

type Props = {
  stage: number; // 1-based label
  state: NodeState;
  stars: number;
  tint: string;
  onPress: () => void;
};

const SIZE = 56;

function LevelNodeBase({ stage, state, stars, tint, onPress }: Props) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  const locked = state === 'locked';
  const cleared = state === 'cleared';

  const dots = [];
  for (let i = 0; i < 3; i++) {
    dots.push(
      <View
        key={i}
        style={[
          styles.starDot,
          { backgroundColor: i < stars ? theme.colors.reward : 'rgba(255,255,255,0.45)' },
        ]}
      />,
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={'STAGE ' + stage}
      style={[styles.press, theme.shadow.soft]}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.fill,
          {
            transform: [{ scale }],
            backgroundColor: cleared ? tint : locked ? theme.colors.disabled : theme.colors.surface,
            borderColor: locked ? theme.colors.disabled : tint,
          },
        ]}>
        {locked ? (
          <Lock size={18} color={theme.colors.textMuted} strokeWidth={2.6} />
        ) : (
          <Text style={[styles.num, { color: cleared ? theme.colors.onAccent : tint }]}>
            {stage}
          </Text>
        )}
        {cleared ? <View style={styles.stars}>{dots}</View> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: SIZE, height: SIZE, borderRadius: SIZE / 2 },
  fill: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  stars: { flexDirection: 'row', gap: 3, marginTop: 3 },
  starDot: { width: 5, height: 5, borderRadius: 3 },
});

export const LevelNode = memo(LevelNodeBase);
export default LevelNode;
