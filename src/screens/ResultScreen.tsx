import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { assets } from '../assets';
import { AppShell } from '../components/AppShell';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import { ConfettiLayer } from '../components/Decor';
import { ProgressBar } from '../components/Common';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatRow } from '../components/Stats';
import { Star } from '../components/icons';
import { TOTAL_STAGES } from '../constants/config';
import { theme } from '../constants/theme';
import { StageReport } from '../game/progressStore';
import { outcomeNote, outcomeTitle } from '../game/rules';

type Props = {
  report: StageReport;
  gentleMotion: boolean;
  hasNext: boolean;
  onPlayAgain: () => void;
  onNextStage: () => void;
  onMenu: () => void;
  onCollection: () => void;
};

function StarPip({ earned, delay }: { earned: boolean; delay: number }) {
  const pop = useRef(new Animated.Value(earned ? 0 : 1)).current;

  useEffect(() => {
    if (!earned) return undefined;
    const anim = Animated.spring(pop, {
      toValue: 1,
      tension: 200,
      friction: 9,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [delay, earned, pop]);

  return (
    <Animated.View style={{ transform: [{ scale: pop }] }}>
      <Star
        size={44}
        color={earned ? theme.colors.reward : theme.colors.disabled}
        strokeWidth={2.4}
      />
    </Animated.View>
  );
}

export default function ResultScreen({
  report,
  gentleMotion,
  hasNext,
  onPlayAgain,
  onNextStage,
  onMenu,
  onCollection,
}: Props) {
  const win = report.outcome === 'harvest';
  const titleColor = win
    ? theme.colors.success
    : report.outcome === 'moves'
    ? theme.colors.secondary
    : theme.colors.danger;

  const grow = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(grow, {
      toValue: 1,
      tension: 200,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [grow]);

  return (
    <AppShell variant="result">
      <ConfettiLayer active={win && !gentleMotion} />

      <ScreenHeader
        title={'STAGE ' + (report.stageIndex + 1) + ' OF ' + TOTAL_STAGES}
        subtitle={outcomeNote(report.outcome)}
      />

      <View style={styles.body} pointerEvents="box-none">
        <Animated.View style={{ transform: [{ scale: grow }] }} pointerEvents="none">
          <Text style={[styles.outcome, { color: titleColor }]}>{outcomeTitle(report.outcome)}</Text>
        </Animated.View>

        <View style={styles.stars} pointerEvents="none">
          <StarPip earned={report.stars >= 1} delay={0} />
          <StarPip earned={report.stars >= 2} delay={140} />
          <StarPip earned={report.stars >= 3} delay={280} />
        </View>

        <StatRow
          items={[
            { value: report.score, label: 'SCORE', accent: theme.colors.primary },
            { value: report.crustCleared, label: 'CRUST CLEARED', accent: theme.colors.secondary },
            { value: report.seedsEarned, label: 'SEEDS', accent: theme.colors.success },
          ]}
        />

        {report.advanced.length > 0 ? (
          <View style={styles.missions} pointerEvents="none">
            {report.advanced.map(m => (
              <View key={m.title} style={styles.missionLine}>
                <Text style={styles.missionText} numberOfLines={1}>
                  {'MISSION: ' + m.title + '  ' + m.cur + '/' + m.target}
                </Text>
                <ProgressBar value={m.cur} max={m.target} height={6} />
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.actions} pointerEvents="box-none">
        <Text style={styles.hint}>
          {win ? 'SEEDS ARE WAITING IN THE GARDEN' : 'TRY A DIFFERENT OPENING GROUP'}
        </Text>

        <PrimaryButton label="PLAY AGAIN" onPress={onPlayAgain} height={56} />

        {win && hasNext ? (
          <>
            <View style={styles.gap} />
            <PrimaryButton
              label="NEXT STAGE"
              onPress={onNextStage}
              colors={theme.gradients.grape as unknown as string[]}
              height={56}
              textured={false}
            />
          </>
        ) : null}

        {report.seedsEarned > 0 ? (
          <>
            <View style={styles.gap} />
            <SecondaryButton
              label="COLLECTION"
              onPress={onCollection}
              height={48}
              tone={theme.colors.success}
            />
          </>
        ) : null}

        <View style={styles.gap} />
        <SecondaryButton
          label="MENU"
          onPress={onMenu}
          imageIcon={assets.iconHome}
          height={48}
          tone={theme.colors.secondary}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  outcome: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1.4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  stars: { flexDirection: 'row', gap: 14 },
  missions: { width: '100%', paddingHorizontal: 24, gap: 8 },
  missionLine: { gap: 5 },
  missionText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: theme.colors.textSoft,
  },
  actions: { paddingHorizontal: 20, paddingBottom: 22 },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textSoft,
    marginBottom: 12,
  },
  gap: { height: 10 },
});
