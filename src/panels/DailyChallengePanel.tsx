import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CANDY_SPRITES } from '../assets';
import { AppShell } from '../components/AppShell';
import { PrimaryButton, RoundIconButton, SecondaryButton } from '../components/Buttons';
import { Pill } from '../components/Common';
import { ScreenHeader } from '../components/ScreenHeader';
import { ArrowLeft, Droplets, Sparkles, Star } from '../components/icons';
import { WORLDS, stageConfig } from '../constants/config';
import { CANDY_NAMES, theme } from '../constants/theme';
import { dailyFor, isDoneToday, streakDots, timeToNext } from '../game/daily';
import { ProgressSnapshot } from '../game/progressStore';

type Props = {
  progress: ProgressSnapshot;
  onBack: () => void;
  onStartDaily: (stageIndex: number) => void;
};

const DOT_LABELS = ['6D', '5D', '4D', '3D', '2D', '1D', 'NOW'];

/**
 * One recipe per calendar day, derived from the date alone - no clock race,
 * no network, identical on every device. Finishing it advances the streak.
 */
export default function DailyChallengePanel({ progress, onBack, onStartDaily }: Props) {
  const now = useMemo(() => new Date(), []);
  const challenge = useMemo(() => dailyFor(now), [now]);
  const done = isDoneToday(progress.daily, now);
  const dots = useMemo(() => streakDots(progress.daily, now), [progress.daily, now]);

  const cfg = stageConfig(challenge.stageIndex);
  const world = WORLDS[cfg.world];
  /* The two candy kinds today's recipe asks for - derived from the day key. */
  const kinds = useMemo(() => {
    const a = challenge.key % CANDY_SPRITES.length;
    const b = (a + 1 + (challenge.key % 3)) % CANDY_SPRITES.length;
    return [a, b];
  }, [challenge.key]);

  return (
    <AppShell variant="daily">
      <ScreenHeader
        title="DAILY RECIPE"
        subtitle={world.name}
        leftSlot={<RoundIconButton label="BACK" Icon={ArrowLeft} onPress={onBack} />}
        rightSlot={
          <Pill Icon={Sparkles} value={progress.daily.streak + 'D'} tone={theme.colors.primary} />
        }
      />

      <View style={styles.body} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={styles.cardTop} pointerEvents="none">
            <Text style={styles.twist}>{challenge.twist.title}</Text>
            <Text style={styles.twistNote}>{challenge.twist.note}</Text>
          </View>

          <View style={styles.kinds} pointerEvents="none">
            {kinds.map(k => (
              <View key={k} style={styles.kind}>
                <Image source={CANDY_SPRITES[k]} style={styles.sprite} resizeMode="contain" />
                <Text style={styles.kindLabel} numberOfLines={1}>
                  {CANDY_NAMES[k]}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.goals} pointerEvents="none">
            <View style={styles.goal}>
              <Text style={[styles.goalValue, { color: theme.colors.primary }]}>
                {challenge.moves}
              </Text>
              <Text style={styles.goalLabel}>MOVES</Text>
            </View>
            <View style={styles.goal}>
              <Text style={[styles.goalValue, { color: theme.colors.secondary }]}>
                {challenge.crustGoal}
              </Text>
              <Text style={styles.goalLabel}>CRUST</Text>
            </View>
            <View style={styles.goal}>
              <Text style={[styles.goalValue, { color: theme.colors.reward }]}>
                {challenge.scoreTarget}
              </Text>
              <Text style={styles.goalLabel}>SCORE</Text>
            </View>
          </View>
        </View>

        <View style={styles.streak} pointerEvents="none">
          <Text style={styles.streakTitle}>SEVEN DAY STREAK</Text>
          <View style={styles.dots}>
            {dots.map((filled, i) => (
              <View key={DOT_LABELS[i]} style={styles.dotCol}>
                <View
                  style={[
                    styles.dot,
                    filled ? styles.dotFilled : null,
                    i === 6 ? styles.dotToday : null,
                  ]}
                />
                <Text style={styles.dotLabel}>{DOT_LABELS[i]}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.best}>
            {'BEST STREAK ' + progress.daily.best + ' · VIRTUAL REWARDS ONLY'}
          </Text>
        </View>
      </View>

      <View style={styles.footer} pointerEvents="box-none">
        {done ? (
          <>
            <Text style={styles.hint}>{'NEXT RECIPE IN ' + timeToNext(now)}</Text>
            <SecondaryButton
              label="COMPLETED TODAY"
              Icon={Star}
              height={56}
              tone={theme.colors.textSoft}
              disabled
              onPress={onBack}
            />
          </>
        ) : (
          <>
            <Text style={styles.hint}>ONE RUN PER DAY · KEEPS THE STREAK ALIVE</Text>
            <PrimaryButton
              label="START CHALLENGE"
              Icon={Droplets}
              height={56}
              onPress={() => onStartDaily(challenge.stageIndex)}
            />
          </>
        )}
        <SecondaryButton
          label="MENU"
          onPress={onBack}
          height={48}
          tone={theme.colors.secondary}
          style={styles.menuBtn}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, gap: 14 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderTopColor: 'rgba(255,255,255,0.95)',
    padding: 16,
    gap: 14,
    ...theme.shadow.clay,
  },
  cardTop: { gap: 4 },
  twist: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: theme.colors.text,
    lineHeight: 24,
  },
  twistNote: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 16,
    color: theme.colors.textSoft,
  },
  kinds: { flexDirection: 'row', gap: 12 },
  kind: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
  },
  sprite: { width: 40, height: 40 },
  kindLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: theme.colors.textSoft,
  },
  goals: { flexDirection: 'row', gap: 10 },
  goal: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceDeep,
  },
  goalValue: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  goalLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.textSoft,
  },
  streak: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  streakTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: theme.colors.text,
  },
  dots: { flexDirection: 'row', justifyContent: 'space-between' },
  dotCol: { alignItems: 'center', gap: 5 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  dotToday: { borderColor: theme.colors.secondary },
  dotLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: theme.colors.textMuted,
  },
  best: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textMuted,
  },
  footer: { paddingHorizontal: 20, paddingBottom: 22, gap: 10 },
  hint: {
    textAlign: 'center',
    marginBottom: 2,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.textSoft,
  },
  menuBtn: { marginTop: 2 },
});
