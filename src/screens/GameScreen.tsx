import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { assets } from '../assets';
import { AppShell } from '../components/AppShell';
import { RoundIconButton } from '../components/Buttons';
import { CandyBoard } from '../components/CandyBoard';
import { FloatingControlBar, GoalStrip, PauseOverlay } from '../components/GameHud';
import { ScreenHeader } from '../components/ScreenHeader';
import { TIMING, WORLDS, stageConfig } from '../constants/config';
import { theme } from '../constants/theme';
import { StageReport } from '../game/progressStore';
import { DAILY_MOVES } from '../game/daily';
import { goalText } from '../game/rules';
import { useGameEngine } from '../hooks/useGameEngine';
import { useHintPulse } from '../hooks/useHintPulse';

type Props = {
  stageIndex: number;
  attempt: number;
  /** True while this run is today's Daily Challenge (tighter move budget). */
  daily?: boolean;
  candyMarks: boolean;
  gentleMotion: boolean;
  hintPulse: boolean;
  onGameOver: (report: StageReport) => void;
  onMenu: () => void;
  onHowTo: () => void;
};

export default function GameScreen({
  stageIndex,
  attempt,
  daily = false,
  candyMarks,
  gentleMotion,
  hintPulse,
  onGameOver,
  onMenu,
  onHowTo,
}: Props) {
  const cfg = stageConfig(stageIndex);
  const world = WORLDS[cfg.world];
  const [paused, setPaused] = useState(false);

  const engine = useGameEngine(
    stageIndex,
    attempt,
    gentleMotion,
    onGameOver,
    daily ? DAILY_MOVES : undefined,
  );
  const { pause, resume } = engine;

  const hintCells = useHintPulse(
    engine.board,
    hintPulse && !paused && !daily,
    engine.status === 'idle',
  );

  useEffect(() => {
    if (paused) pause();
    else resume();
  }, [paused, pause, resume]);

  const openPause = useCallback(() => setPaused(true), []);
  const closePause = useCallback(() => setPaused(false), []);

  const movesLow = engine.stats.moves <= 3;
  const fallMs = gentleMotion ? TIMING.fallGentle : TIMING.fall;
  const showHint = daily || stageIndex < 3 || hintCells.length > 0;

  return (
    <AppShell variant="game" tint={world.tint}>
      <ScreenHeader
        solid
        title={daily ? 'DAILY RECIPE' : 'STAGE ' + (stageIndex + 1)}
        subtitle={goalText(engine.stats, cfg)}
        leftSlot={
          <RoundIconButton
            label="PAUSE"
            imageIcon={assets.iconPause}
            onPress={openPause}
          />
        }
        rightSlot={
          <View style={styles.movesPill}>
            <Text style={styles.movesCaption}>MOVES</Text>
            <Text
              style={[
                styles.movesValue,
                { color: movesLow ? theme.colors.danger : theme.colors.secondary },
              ]}>
              {engine.stats.moves}
            </Text>
          </View>
        }
      />

      <GoalStrip
        crustCleared={engine.stats.crustCleared}
        crustGoal={cfg.crustGoal}
        score={engine.stats.score}
        scoreTarget={cfg.scoreTarget}
        spoils={engine.stats.spoils}
      />

      {showHint ? (
        <Text style={styles.hint}>
          {daily
            ? 'DAILY RUN · NO HINT PULSE · TAP 2+ TOUCHING CANDIES'
            : 'TAP 2+ TOUCHING CANDIES OF ONE COLOUR'}
        </Text>
      ) : (
        <View style={styles.hintSpacer} />
      )}

      <View style={styles.area} pointerEvents="box-none">
        <CandyBoard
          board={engine.board}
          poppingIds={engine.poppingIds}
          spoilId={engine.spoilId}
          hintCells={hintCells}
          marks={candyMarks}
          fallMs={fallMs}
          dimmed={engine.status === 'win' || engine.status === 'lose'}
          onTapCell={engine.tapCell}
        />
      </View>

      {engine.status === 'win' ? (
        <View style={styles.banner} pointerEvents="none">
          <Text style={styles.bannerText}>GARDEN HARVEST!</Text>
        </View>
      ) : null}

      <FloatingControlBar
        charge={engine.stats.rainCharge}
        ready={engine.rainReady && engine.status === 'idle'}
        onDrop={engine.dropRain}
      />

      {paused ? (
        <PauseOverlay onResume={closePause} onHowTo={onHowTo} onMenu={onMenu} />
      ) : null}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  movesPill: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 62,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    ...theme.shadow.soft,
  },
  movesCaption: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.textSoft,
    lineHeight: 12,
  },
  movesValue: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  hint: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textSoft,
    height: 26,
    lineHeight: 26,
  },
  hintSpacer: { height: 26 },
  area: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', marginTop: 4 },
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42%',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.success,
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
