import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CANDY_SPRITES } from '../assets';
import { TIMING } from '../constants/config';
import { CANDY_COLORS, CANDY_MARKS, CANDY_NAMES, theme } from '../constants/theme';
import { Cell, EMPTY } from '../game/board';

type Props = {
  cell: Cell;
  index: number;
  size: number;
  popping: boolean;
  spoiling: boolean;
  hinted: boolean;
  marks: boolean;
  fallMs: number;
  onPress: (index: number) => void;
};

function CandyTileBase({ cell, index, size, popping, spoiling, hinted, marks, fallMs, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  /* Gravity: the cell slides in from where it fell. */
  useEffect(() => {
    scale.setValue(1);
    opacity.setValue(1);
    if (cell.fall > 0) {
      translateY.setValue(-cell.fall * size);
      Animated.timing(translateY, {
        toValue: 0,
        duration: fallMs,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      translateY.setValue(0);
    }
  }, [cell.id, cell.fall, fallMs, opacity, scale, size, translateY]);

  /* Burst. */
  useEffect(() => {
    if (!popping) return;
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.25,
          duration: TIMING.pop * 0.4,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: TIMING.pop * 0.6,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: TIMING.pop,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, popping, scale]);

  /* Spoil shake. */
  useEffect(() => {
    if (!spoiling) {
      translateX.setValue(0);
      return;
    }
    Animated.sequence([
      Animated.timing(translateX, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -4, duration: 60, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [spoiling, translateX]);

  /* Hint breathing - two cycles, opacity only. */
  useEffect(() => {
    if (!hinted) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 420, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      ]),
      { iterations: 2 },
    );
    loop.start();
    return () => loop.stop();
  }, [hinted, opacity]);

  const handlePress = () => onPress(index);

  if (cell.color === EMPTY) {
    return <View style={{ width: size, height: size }} />;
  }

  const inner = size - 8;
  const colour = CANDY_COLORS[cell.color] || CANDY_COLORS[0];
  const sprite = CANDY_SPRITES[cell.color] || CANDY_SPRITES[0];
  const label = cell.rainbow ? 'RAINBOW DROP' : CANDY_NAMES[cell.color] + ' CANDY';

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="box-none"
        style={{
          width: inner,
          height: inner,
          opacity,
          transform: [{ translateY }, { translateX }, { scale }],
        }}>
        <View
          style={[
            styles.body,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2.6,
              backgroundColor: cell.rainbow ? theme.colors.surface : colour,
              shadowColor: colour,
            },
          ]}>
          {cell.rainbow ? (
            <LinearGradient
              colors={CANDY_COLORS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: inner / 2.6 }]}
            />
          ) : null}
          <Image
            source={sprite}
            style={{ width: inner - 8, height: inner - 8 }}
            resizeMode="contain"
          />
          <View
            style={[
              styles.highlight,
              { width: inner * 0.34, height: inner * 0.2, borderRadius: inner * 0.17 },
            ]}
          />
          {cell.rainbow ? <Text style={styles.rainbowMark}>{'★'}</Text> : null}
          {marks && !cell.rainbow ? (
            <Text style={styles.mark}>{CANDY_MARKS[cell.color]}</Text>
          ) : null}
        </View>

        {cell.crust > 0 ? (
          <View style={[styles.crust, { borderRadius: inner / 2.6 }]}>
            <View style={styles.crack} />
            {cell.crust > 1 ? <View style={[styles.crack, styles.crackTwo]} /> : null}
          </View>
        ) : null}

        {hinted ? <View style={[styles.hintRing, { borderRadius: inner / 2.6 }]} /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  highlight: {
    position: 'absolute',
    top: '14%',
    left: '14%',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  mark: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
  },
  rainbowMark: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  crust: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 2,
    borderColor: '#D9C4E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crack: {
    position: 'absolute',
    width: '62%',
    height: 2,
    backgroundColor: '#C9A9DE',
    transform: [{ rotate: '24deg' }],
  },
  crackTwo: { transform: [{ rotate: '-38deg' }], width: '48%', top: '32%' },
  hintRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export const CandyTile = memo(CandyTileBase);
export default CandyTile;
