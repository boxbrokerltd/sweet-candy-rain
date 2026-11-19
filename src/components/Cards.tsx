import React, { memo, useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { CANDY_SPRITES } from '../assets';
import { theme } from '../constants/theme';
import { MissionState } from '../constants/missions';
import { Plant } from '../constants/plants';
import { usePressScale } from '../hooks/usePressScale';
import { ProgressBar } from './Common';
import { CheckCircle2, Gift, ListChecks, Sprout } from './icons';

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/* ------------------------- PlantPlot ------------------------- */

type PlotProps = {
  plant: Plant;
  bloomed: boolean;
  seeds: number;
  onPlant: () => void;
};

function PlantPlotBase({ plant, bloomed, seeds, onPlant }: PlotProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const affordable = seeds >= plant.cost;
  const sprite = CANDY_SPRITES[plant.id % CANDY_SPRITES.length];

  return (
    <View style={styles.plotSlot}>
      <View style={[styles.plot, bloomed ? styles.plotBloomed : null]}>
        {bloomed ? (
          <Image source={sprite} style={styles.plotSprite} resizeMode="contain" />
        ) : (
          <Sprout size={26} color={theme.colors.disabled} strokeWidth={2.4} />
        )}
        <Text style={styles.plotName} numberOfLines={1}>
          {plant.name}
        </Text>
        {bloomed ? (
          <Text style={styles.plotBloom}>IN BLOOM</Text>
        ) : (
          <Pressable
            onPress={onPlant}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={!affordable}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel={'PLANT ' + plant.name}
            style={styles.plotPress}>
            <Animated.View
              pointerEvents="box-none"
              style={[
                styles.plotBtn,
                {
                  transform: [{ scale }],
                  backgroundColor: affordable ? theme.colors.success : theme.colors.disabled,
                },
              ]}>
              <Text style={styles.plotBtnText}>{'PLANT ' + plant.cost}</Text>
            </Animated.View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ------------------------- ChestCard ------------------------- */

type ChestProps = {
  chestId: number;
  needStars: number;
  seeds: number;
  tokens: number;
  headStart: boolean;
  stars: number;
  claimed: boolean;
  tint: string;
  onClaim: () => void;
};

function ChestCardBase({
  needStars,
  seeds,
  tokens,
  headStart,
  stars,
  claimed,
  tint,
  onClaim,
}: ChestProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const breathe = useRef(new Animated.Value(1)).current;
  const ready = !claimed && stars >= needStars;

  useEffect(() => {
    if (!ready) {
      breathe.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, ready]);

  return (
    <View style={styles.chestSlot}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.chest,
          claimed ? styles.chestClaimed : null,
          { transform: [{ scale: breathe }] },
        ]}>
        {ready ? (
          <LinearGradient
            colors={[tint + '33', tint + '11']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, styles.chestGlow]}
          />
        ) : null}
        <Gift size={40} color={claimed ? theme.colors.disabled : tint} strokeWidth={2.2} />
        <Text style={styles.chestTitle}>{needStars + ' STARS'}</Text>
        <Text style={styles.chestReward} numberOfLines={2}>
          {'+' + seeds + ' SEEDS · +' + tokens + ' TOKENS'}
        </Text>
        {headStart ? <Text style={styles.chestBonus}>RAIN HEAD START</Text> : null}

        {claimed ? (
          <Text style={styles.chestClaimedText}>{'✓ CLAIMED'}</Text>
        ) : ready ? (
          <Pressable
            onPress={onClaim}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            hitSlop={HIT}
            accessibilityRole="button"
            accessibilityLabel="CLAIM"
            style={styles.claimPress}>
            <Animated.View
              pointerEvents="box-none"
              style={[styles.claimBtn, { transform: [{ scale }], backgroundColor: tint }]}>
              <Text style={styles.claimText}>CLAIM</Text>
            </Animated.View>
          </Pressable>
        ) : (
          <View style={styles.chestLock}>
            <ProgressBar value={stars} max={needStars} height={6} colors={[tint, tint]} />
            <Text style={styles.chestLockText}>{stars + '/' + needStars + '★'}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

/* ------------------------- MissionCard ------------------------- */

type MissionProps = { mission: MissionState; tint: string; onClaim: () => void };

function MissionCardBase({ mission, tint, onClaim }: MissionProps) {
  const { scale, onPressIn, onPressOut } = usePressScale(0.94);
  const done = mission.progress >= mission.def.target;

  return (
    <View style={styles.mission}>
      <View style={[styles.missionIcon, { backgroundColor: tint + '22' }]}>
        {done ? (
          <CheckCircle2 size={24} color={theme.colors.success} strokeWidth={2.5} />
        ) : (
          <ListChecks size={24} color={tint} strokeWidth={2.5} />
        )}
      </View>
      <View style={styles.missionBody}>
        <Text style={styles.missionTitle} numberOfLines={1}>
          {mission.def.title}
        </Text>
        <Text style={styles.missionDesc} numberOfLines={2}>
          {mission.def.description}
        </Text>
        <View style={styles.missionBar}>
          <ProgressBar
            value={mission.progress}
            max={mission.def.target}
            height={8}
            colors={[tint, theme.colors.primary]}
          />
        </View>
        <Text style={styles.missionMeta}>
          {mission.progress + '/' + mission.def.target + '  ·  +' + mission.def.seeds + ' SEEDS · +' + mission.def.tokens + ' TOKENS'}
        </Text>
      </View>
      {done && !mission.claimed ? (
        <Pressable
          onPress={onClaim}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          hitSlop={HIT}
          accessibilityRole="button"
          accessibilityLabel="CLAIM MISSION"
          style={styles.missionClaimPress}>
          <Animated.View
            pointerEvents="box-none"
            style={[styles.missionClaim, { transform: [{ scale }] }]}>
            <Text style={styles.claimText}>CLAIM</Text>
          </Animated.View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  /* plot */
  plotSlot: { width: '25%', padding: 5 },
  plot: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
    ...theme.shadow.soft,
  },
  plotBloomed: { backgroundColor: '#EFFBF5', borderColor: '#BCEBD9' },
  plotSprite: { width: 30, height: 30 },
  plotName: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: theme.colors.text,
    textAlign: 'center',
  },
  plotBloom: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.success,
    lineHeight: 14,
  },
  plotPress: { width: '100%', height: 26 },
  plotBtn: {
    width: '100%',
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plotBtnText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#FFFFFF',
    lineHeight: 12,
  },

  /* chest */
  chestSlot: { width: '50%', padding: 6 },
  chest: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    overflow: 'hidden',
    gap: 4,
    ...theme.shadow.clay,
  },
  chestGlow: { borderRadius: theme.radius.xl },
  chestClaimed: { backgroundColor: theme.colors.surfaceAlt },
  chestTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.text,
    lineHeight: 17,
  },
  chestReward: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
  chestBonus: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.reward,
  },
  chestClaimedText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.success,
    lineHeight: 16,
  },
  chestLock: { width: '100%', marginTop: 8, alignItems: 'center', gap: 4 },
  chestLockText: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
  },
  claimPress: { width: '100%', height: 44, marginTop: 8 },
  claimBtn: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#FFFFFF',
    lineHeight: 18,
  },

  /* mission */
  mission: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    ...theme.shadow.clay,
  },
  missionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionBody: { flex: 1, gap: 4 },
  missionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.text,
    lineHeight: 18,
  },
  missionDesc: { fontSize: 11, lineHeight: 15, color: theme.colors.textSoft, fontWeight: '600' },
  missionBar: { width: '100%', marginTop: 2 },
  missionMeta: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: theme.colors.textMuted,
  },
  missionClaimPress: { width: 74, height: 44 },
  missionClaim: {
    width: 74,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success,
  },
});

export const PlantPlot = memo(PlantPlotBase);
export const ChestCard = memo(ChestCardBase);
export const MissionCard = memo(MissionCardBase);
