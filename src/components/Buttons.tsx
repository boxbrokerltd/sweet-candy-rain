import React, { memo } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** Icons in buttons are ALWAYS 24x24 and the label lineHeight is ALWAYS 24. */
export const ICON_SIZE = 24;

import type { IconComp } from './icons';

type PrimaryProps = {
  label: string;
  onPress: () => void;
  Icon?: IconComp;
  imageIcon?: ImageSourcePropType;
  colors?: string[];
  disabled?: boolean;
  height?: number;
  style?: ViewStyle;
  textured?: boolean;
};

function PrimaryButtonBase({
  label,
  onPress,
  Icon,
  imageIcon,
  colors,
  disabled,
  height = 56,
  style,
  textured = true,
}: PrimaryProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.95);
  const palette = colors || (theme.gradients.primary as unknown as string[]);
  const labelColor = disabled ? theme.colors.textMuted : theme.colors.onAccent;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.primaryPress, { height }, disabled ? null : theme.shadow.cta, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.primaryFill, { height, transform: [{ scale }] }]}>
        {disabled ? (
          <View style={[StyleSheet.absoluteFillObject, styles.disabledFill]} />
        ) : (
          <LinearGradient
            colors={palette}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        {textured && !disabled ? (
          <Image
            source={assets.buttonRect}
            style={[StyleSheet.absoluteFillObject, styles.texture]}
            resizeMode="stretch"
          />
        ) : null}
        <View style={styles.rowInner}>
          {Icon ? <Icon size={ICON_SIZE} color={labelColor} strokeWidth={2.4} /> : null}
          {imageIcon ? <Image source={imageIcon} style={styles.imageIcon} resizeMode="contain" /> : null}
          <Text style={[styles.primaryLabel, { color: labelColor }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

type SecondaryProps = {
  label: string;
  onPress: () => void;
  Icon?: IconComp;
  imageIcon?: ImageSourcePropType;
  height?: number;
  tone?: string;
  style?: ViewStyle;
};

function SecondaryButtonBase({
  label,
  onPress,
  Icon,
  imageIcon,
  height = 48,
  tone = theme.colors.text,
  style,
}: SecondaryProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.96);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.secondaryPress, { height }, theme.shadow.soft, style]}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.secondaryFill, { height, transform: [{ scale }] }]}>
        <View style={styles.rowInner}>
          {Icon ? <Icon size={ICON_SIZE} color={tone} strokeWidth={2.4} /> : null}
          {imageIcon ? <Image source={imageIcon} style={styles.imageIcon} resizeMode="contain" /> : null}
          <Text style={[styles.secondaryLabel, { color: tone }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

type RoundProps = {
  onPress: () => void;
  Icon?: IconComp;
  imageIcon?: ImageSourcePropType;
  label: string;
  tone?: string;
};

function RoundIconButtonBase({ onPress, Icon, imageIcon, label, tone = theme.colors.secondary }: RoundProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.92);
  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.roundPress, theme.shadow.soft]}>
      <Animated.View pointerEvents="box-none" style={[styles.roundFill, { transform: [{ scale }] }]}>
        <Image source={assets.buttonRound} style={styles.roundPlate} resizeMode="contain" />
        {Icon ? <Icon size={22} color={tone} strokeWidth={2.6} /> : null}
        {imageIcon ? <Image source={imageIcon} style={styles.roundGlyph} resizeMode="contain" /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryPress: {
    width: '100%',
    borderRadius: 22,
  },
  primaryFill: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.45)',
  },
  disabledFill: { backgroundColor: theme.colors.disabled },
  texture: { opacity: 0.3 },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  primaryLabel: {
    fontSize: 16,
    lineHeight: ICON_SIZE,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  secondaryPress: { width: '100%', borderRadius: 20 },
  secondaryFill: {
    width: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryLabel: {
    fontSize: 15,
    lineHeight: ICON_SIZE,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  roundPress: { width: 48, height: 48, borderRadius: 24 },
  roundFill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  roundPlate: { position: 'absolute', width: 48, height: 48, opacity: 0.75 },
  roundGlyph: { width: 22, height: 22 },
  imageIcon: { width: ICON_SIZE, height: ICON_SIZE },
});

export const PrimaryButton = memo(PrimaryButtonBase);
export const SecondaryButton = memo(SecondaryButtonBase);
export const RoundIconButton = memo(RoundIconButtonBase);
