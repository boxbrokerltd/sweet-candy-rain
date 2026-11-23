import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MAX_SPOILS, RAIN_CAP } from '../constants/config';
import { theme } from '../constants/theme';
import { formatScore } from '../utils/format';
import { PrimaryButton, SecondaryButton } from './Buttons';
import { ProgressBar } from './Common';
import { Droplets, Sparkles, Star } from './icons';

/* ------------------------- GoalStrip ------------------------- */

type GoalProps = {
  crustCleared: number;
  crustGoal: number;
  score: number;
  scoreTarget: number;
  spoils: number;
};

function GoalStripBase({ crustCleared, crustGoal, score, scoreTarget, spoils }: GoalProps) {
  const pips = [];
  for (let i = 0; i < MAX_SPOILS; i++) {
    pips.push(
      <View
        key={i}
        style={[
          styles.pip,
          { backgroundColor: i < MAX_SPOILS - spoils ? theme.colors.success : theme.colors.disabled },
        ]}
      />,
    );
  }

  return (
    <View style={styles.strip}>
      <View style={styles.chip}>
        <Sparkles size={16} color={theme.colors.secondary} strokeWidth={2.6} />
        <Text style={[styles.chipText, { color: theme.colors.secondary }]}>
          {Math.min(crustCleared, crustGoal) + '/' + crustGoal}
        </Text>
      </View>
      <View style={styles.chip}>
        <Star size={16} color={theme.colors.primary} strokeWidth={2.6} />
        <Text style={[styles.chipText, { color: theme.colors.primary }]}>
          {formatScore(score) + '/' + formatScore(scoreTarget)}
        </Text>
      </View>
      <View style={styles.chip}>
        <Text style={styles.freshLabel}>FRESH</Text>
        <View style={styles.pips}>{pips}</View>
      </View>
    </View>
  );
}

/* ------------------------- FloatingControlBar ------------------------- */

type BarProps = {
  charge: number;
  ready: boolean;
  onDrop: () => void;
};

function FloatingControlBarBase({ charge, ready, onDrop }: BarProps) {
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!ready) {
      breathe.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.03, duration: 600, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, ready]);

  return (
    <View style={styles.bar} pointerEvents="box-none">
      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>CANDY RAIN</Text>
        <Text style={styles.meterValue}>{Math.round((charge / RAIN_CAP) * 100) + '%'}</Text>
      </View>
      <ProgressBar value={charge} max={RAIN_CAP} height={10} />
      <Animated.View
        pointerEvents="box-none"
        style={[styles.ctaWrap, { transform: [{ scale: breathe }] }]}>
        <PrimaryButton
          label="DROP CANDY RAIN"
          Icon={Droplets}
          onPress={onDrop}
          disabled={!ready}
          height={48}
          textured={false}
        />
      </Animated.View>
    </View>
  );
}

/* ------------------------- PauseOverlay ------------------------- */

type PauseProps = {
  onResume: () => void;
  onHowTo: () => void;
  onMenu: () => void;
};

function PauseOverlayBase({ onResume, onHowTo, onMenu }: PauseProps) {
  return (
    <View style={styles.scrimWrap} pointerEvents="box-none">
      <View style={styles.scrim} onTouchEnd={onResume} />
      <View style={styles.pauseCard} pointerEvents="box-none">
        <Text style={styles.pauseTitle}>PAUSED</Text>
        <Text style={styles.pauseNote}>THE SUGAR RAIN IS HOLDING STILL</Text>
        <PrimaryButton label="RESUME" onPress={onResume} height={56} />
        <View style={styles.pauseGap} />
        <SecondaryButton label="HOW TO PLAY" onPress={onHowTo} height={48} />
        <View style={styles.pauseGap} />
        <SecondaryButton label="MENU" onPress={onMenu} height={48} tone={theme.colors.secondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    height: 44,
    alignItems: 'center',
  },
  chip: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...theme.shadow.soft,
  },
  chipText: { fontSize: 12, fontWeight: '800', lineHeight: 16, letterSpacing: 0.2 },
  freshLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.textSoft,
    lineHeight: 12,
  },
  pips: { flexDirection: 'row', gap: 4 },
  pip: { width: 10, height: 10, borderRadius: 5 },

  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    ...theme.shadow.deep,
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  meterLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.textSoft,
  },
  meterValue: { fontSize: 11, fontWeight: '800', color: theme.colors.primary },
  ctaWrap: { marginTop: 10 },

  scrimWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(58,15,46,0.55)' },
  pauseCard: {
    width: '82%',
    maxWidth: 340,
    padding: 22,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    ...theme.shadow.deep,
  },
  pauseTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.text,
  },
  pauseNote: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
  pauseGap: { height: 10 },
});

export const GoalStrip = memo(GoalStripBase);
export const FloatingControlBar = memo(FloatingControlBarBase);
export const PauseOverlay = memo(PauseOverlayBase);
