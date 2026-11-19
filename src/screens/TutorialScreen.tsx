import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { PrimaryButton, RoundIconButton, SecondaryButton } from '../components/Buttons';
import { CandyTile } from '../components/CandyTile';
import { ClayCard, ProgressBar } from '../components/Common';
import { ScreenHeader } from '../components/ScreenHeader';
import { ArrowLeft } from '../components/icons';
import { MAX_SPOILS, RAIN_CAP, TIMING } from '../constants/config';
import { theme } from '../constants/theme';
import { Cell } from '../game/board';

type Props = {
  onBack: () => void;
  onStartPlaying: () => void;
};

const DEMO_TILE = 54;
const DEMO_COLS = 4;

type Step = {
  title: string;
  text: string;
  colors: number[];
  crust: number[];
  highlight: number[];
  meter: number;
  spoils: number;
};

const STEPS: Step[] = [
  {
    title: 'TAP A GROUP',
    text: 'Tap 2 or more touching candies of the same colour. Bigger groups score much more.',
    colors: [0, 0, 2, 3, 0, 0, 4, 1, 3, 2, 1, 4, 1, 4, 3, 2],
    crust: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    highlight: [0, 1, 4, 5],
    meter: 20,
    spoils: 0,
  },
  {
    title: 'CRACK THE CRUST',
    text: 'Bursting next to a frosted tile cracks one layer. Clear every crust to finish the stage.',
    colors: [2, 2, 1, 3, 0, 4, 1, 1, 3, 2, 0, 4, 1, 4, 3, 2],
    crust: [0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
    highlight: [6, 7],
    meter: 45,
    spoils: 0,
  },
  {
    title: 'WATCH THE FRESHNESS',
    text: 'Tapping a lone candy spoils it. Three spoils and the stage ends as SUGAR SPILLED.',
    colors: [1, 3, 2, 4, 3, 0, 4, 1, 2, 4, 3, 0, 4, 1, 0, 2],
    crust: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    highlight: [5],
    meter: 60,
    spoils: 2,
  },
  {
    title: 'DROP THE CANDY RAIN',
    text: 'Bursts fill the rain meter. At full, DROP CANDY RAIN cracks the worst columns for free.',
    colors: [0, 1, 2, 3, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1],
    crust: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1, 0],
    highlight: [],
    meter: RAIN_CAP,
    spoils: 0,
  },
];

export default function TutorialScreen({ onBack, onStartPlaying }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const cells = useMemo<Cell[]>(
    () =>
      current.colors.map((color, i) => ({
        id: step * 100 + i,
        color,
        crust: current.crust[i],
        rainbow: false,
        fall: 0,
      })),
    [current, step],
  );

  const next = useCallback(() => {
    if (step >= STEPS.length - 1) {
      onStartPlaying();
      return;
    }
    setStep(s => s + 1);
  }, [onStartPlaying, step]);

  const noop = useCallback(() => {}, []);

  const pips = [];
  for (let i = 0; i < MAX_SPOILS; i++) {
    pips.push(
      <View
        key={i}
        style={[
          styles.pip,
          {
            backgroundColor:
              i < MAX_SPOILS - current.spoils ? theme.colors.success : theme.colors.disabled,
          },
        ]}
      />,
    );
  }

  return (
    <AppShell variant="tutorial">
      <ScreenHeader
        title="HOW TO PLAY"
        subtitle={'STEP ' + (step + 1) + ' OF ' + STEPS.length}
        leftSlot={<RoundIconButton label="BACK" Icon={ArrowLeft} onPress={onBack} />}
      />

      <View style={styles.body} pointerEvents="box-none">
        <View style={styles.demoFrame} pointerEvents="none">
          <View style={styles.demoGrid}>
            {cells.map((cell, i) => (
              <CandyTile
                key={i}
                index={i}
                cell={cell}
                size={DEMO_TILE}
                popping={false}
                spoiling={false}
                hinted={current.highlight.indexOf(i) >= 0}
                marks
                fallMs={TIMING.fall}
                onPress={noop}
              />
            ))}
          </View>
        </View>

        <ClayCard style={styles.card}>
          <Text style={styles.stepTitle}>{current.title}</Text>
          <Text style={styles.stepText}>{current.text}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>CANDY RAIN</Text>
              <ProgressBar value={current.meter} max={RAIN_CAP} height={8} />
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>FRESHNESS</Text>
              <View style={styles.pips}>{pips}</View>
            </View>
          </View>
        </ClayCard>

        <View style={styles.dots} pointerEvents="none">
          {STEPS.map((s, i) => (
            <View
              key={s.title}
              style={[
                styles.dot,
                i === step ? styles.dotActive : null,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions} pointerEvents="box-none">
        <PrimaryButton
          label={step >= STEPS.length - 1 ? 'START PLAYING' : 'NEXT'}
          onPress={next}
          height={56}
        />
        <View style={styles.gap} />
        <SecondaryButton
          label="MENU"
          onPress={onBack}
          height={48}
          tone={theme.colors.secondary}
        />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', paddingHorizontal: 20, gap: 14 },
  demoFrame: {
    padding: 6,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: '#F6D9E7',
    ...theme.shadow.clay,
  },
  demoGrid: {
    width: DEMO_TILE * DEMO_COLS,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: { width: '100%', padding: 16, gap: 8 },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: theme.colors.text,
  },
  stepText: { fontSize: 13, lineHeight: 19, fontWeight: '600', color: theme.colors.textSoft },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 6 },
  metaCol: { flex: 1, gap: 6 },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
  },
  pips: { flexDirection: 'row', gap: 6 },
  pip: { width: 10, height: 10, borderRadius: 5 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.disabled },
  dotActive: { width: 20, borderRadius: 4, backgroundColor: theme.colors.primary },
  actions: { paddingHorizontal: 20, paddingBottom: 22 },
  gap: { height: 10 },
});
