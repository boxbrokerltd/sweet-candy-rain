/**
 * Candy Current - SweetCandyRain
 * Screen state machine. No navigation library: one place owns the screen.
 *
 * The four capture-path views live in src/screens (Loader -> Menu -> Game ->
 * GameOver); the seven auxiliary views live in src/panels and are reached in
 * one tap from the Menu or the result screen.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';
import { TIMING } from './src/constants/config';
import { theme } from './src/constants/theme';
import { StageReport, progressStore } from './src/game/progressStore';
import { bloomCount, hasNextStage, nextPlayableStage } from './src/game/progression';
import { useProgress } from './src/hooks/useProgress';
import CollectionPanel from './src/panels/CollectionPanel';
import DailyChallengePanel from './src/panels/DailyChallengePanel';
import MissionsPanel from './src/panels/MissionsPanel';
import PuzzleMapPanel from './src/panels/PuzzleMapPanel';
import RewardsPanel from './src/panels/RewardsPanel';
import SettingsPanel from './src/panels/SettingsPanel';
import TutorialPanel from './src/panels/TutorialPanel';
import GameOverScreen from './src/screens/GameOverScreen';
import GameScreen from './src/screens/GameScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'tutorial'
  | 'game'
  | 'gameover'
  | 'levelmap'
  | 'daily'
  | 'missions'
  | 'rewards'
  | 'collection'
  | 'settings';

export default function App(): React.JSX.Element {
  const progress = useProgress();
  const gentle = progress.settings.gentleMotion;

  const [screen, setScreen] = useState<Screen>('loader');
  const [stageIndex, setStageIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [dailyRun, setDailyRun] = useState(false);
  const [report, setReport] = useState<StageReport | null>(null);

  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const screenRef = useRef<Screen>('loader');
  screenRef.current = screen;
  /* Animation callbacks read the live flag from a ref, never a stale closure. */
  const dailyRef = useRef(false);
  dailyRef.current = dailyRun;

  const navigate = useCallback(
    (next: Screen, before?: () => void) => {
      if (screenRef.current === next) {
        if (before) before();
        return;
      }
      const duration = gentle ? TIMING.screenFadeGentle : TIMING.screenFade;
      Animated.timing(fade, {
        toValue: 0,
        duration: Math.round(duration / 2),
        useNativeDriver: true,
      }).start(() => {
        if (before) before();
        setScreen(next);
        slide.setValue(12);
        Animated.parallel([
          Animated.timing(fade, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(slide, { toValue: 0, duration, useNativeDriver: true }),
        ]).start();
      });
    },
    [fade, gentle, slide],
  );

  /* System Back: Menu closes the app, every other screen goes back one step. */
  useEffect(() => {
    const onBack = () => {
      const current = screenRef.current;
      if (current === 'menu') return false;
      if (current === 'loader') return true;
      navigate('menu');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [navigate]);

  const goMenu = useCallback(() => navigate('menu'), [navigate]);

  const startStage = useCallback(
    (index: number, nextAttempt: number, daily = false) => {
      navigate('game', () => {
        setStageIndex(index);
        setAttempt(nextAttempt);
        setDailyRun(daily);
        setReport(null);
      });
    },
    [navigate],
  );

  const onPlay = useCallback(() => {
    const blooms = bloomCount(progressStore.getState().bloomed);
    const index = nextPlayableStage(progressStore.getState().stageStars, blooms);
    startStage(index, 0);
  }, [startStage]);

  const onGameOver = useCallback(
    (raw: StageReport) => {
      const finished = progressStore.finishStage(raw);
      /* A cleared Daily run is what advances the streak - a loss leaves it. */
      if (dailyRef.current && raw.outcome === 'harvest') {
        progressStore.completeDaily();
      }
      navigate('gameover', () => setReport(finished));
    },
    [navigate],
  );

  const onPlayAgain = useCallback(() => {
    startStage(stageIndex, attempt + 1, dailyRef.current);
  }, [attempt, stageIndex, startStage]);

  const onNextStage = useCallback(() => {
    startStage(Math.min(stageIndex + 1, 11), 0);
  }, [stageIndex, startStage]);

  const onTutorialStart = useCallback(() => {
    progressStore.markTutorialSeen();
    onPlay();
  }, [onPlay]);

  const onPlayStage = useCallback(
    (index: number) => {
      startStage(index, 0);
    },
    [startStage],
  );

  const onStartDaily = useCallback(
    (index: number) => {
      startStage(index, progress.daily.streak + 1, true);
    },
    [progress.daily.streak, startStage],
  );

  const renderMenu = () => (
    <MenuScreen
      progress={progress}
      onPlay={onPlay}
      onLevels={() => navigate('levelmap')}
      onDaily={() => navigate('daily')}
      onMissions={() => navigate('missions')}
      onRewards={() => navigate('rewards')}
      onCollection={() => navigate('collection')}
      onTutorial={() => navigate('tutorial')}
      onSettings={() => navigate('settings')}
    />
  );

  let content: React.ReactNode = null;

  if (screen === 'loader') {
    content = <LoaderScreen onDone={goMenu} />;
  } else if (screen === 'menu') {
    content = renderMenu();
  } else if (screen === 'tutorial') {
    content = <TutorialPanel onBack={goMenu} onStartPlaying={onTutorialStart} />;
  } else if (screen === 'game') {
    content = (
      <GameScreen
        stageIndex={stageIndex}
        attempt={attempt}
        daily={dailyRun}
        candyMarks={progress.settings.candyMarks}
        gentleMotion={gentle}
        hintPulse={progress.settings.hintPulse}
        onGameOver={onGameOver}
        onMenu={goMenu}
        onHowTo={() => navigate('tutorial')}
      />
    );
  } else if (screen === 'gameover' && report) {
    content = (
      <GameOverScreen
        report={report}
        gentleMotion={gentle}
        daily={dailyRun}
        hasNext={hasNextStage(report.stageIndex, progress.stageStars, bloomCount(progress.bloomed))}
        onPlayAgain={onPlayAgain}
        onNextStage={onNextStage}
        onMenu={goMenu}
        onLevels={() => navigate('levelmap')}
        onCollection={() => navigate('collection')}
      />
    );
  } else if (screen === 'levelmap') {
    content = <PuzzleMapPanel progress={progress} onBack={goMenu} onPlayStage={onPlayStage} />;
  } else if (screen === 'daily') {
    content = (
      <DailyChallengePanel progress={progress} onBack={goMenu} onStartDaily={onStartDaily} />
    );
  } else if (screen === 'missions') {
    content = <MissionsPanel progress={progress} onBack={goMenu} />;
  } else if (screen === 'rewards') {
    content = <RewardsPanel progress={progress} onBack={goMenu} />;
  } else if (screen === 'collection') {
    content = <CollectionPanel progress={progress} onBack={goMenu} />;
  } else if (screen === 'settings') {
    content = <SettingsPanel progress={progress} onBack={goMenu} onReset={goMenu} />;
  } else {
    content = renderMenu();
  }

  return (
    <View style={styles.root}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.layer, { opacity: fade, transform: [{ translateY: slide }] }]}>
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  layer: { flex: 1 },
});
