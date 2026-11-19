/**
 * Candy Current - SweetCandyRain
 * Screen state machine. No navigation library: one place owns the screen.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';
import { TIMING } from './src/constants/config';
import { theme } from './src/constants/theme';
import {
  StageReport,
  progressStore,
} from './src/game/progressStore';
import { bloomCount, hasNextStage, nextPlayableStage } from './src/game/progression';
import { useProgress } from './src/hooks/useProgress';
import CollectionScreen from './src/screens/CollectionScreen';
import GameScreen from './src/screens/GameScreen';
import LevelMapScreen from './src/screens/LevelMapScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import MissionsScreen from './src/screens/MissionsScreen';
import ResultScreen from './src/screens/ResultScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TutorialScreen from './src/screens/TutorialScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'tutorial'
  | 'game'
  | 'result'
  | 'levelmap'
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
  const [report, setReport] = useState<StageReport | null>(null);

  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const screenRef = useRef<Screen>('loader');
  screenRef.current = screen;

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
    (index: number, nextAttempt: number) => {
      navigate('game', () => {
        setStageIndex(index);
        setAttempt(nextAttempt);
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
      navigate('result', () => setReport(finished));
    },
    [navigate],
  );

  const onPlayAgain = useCallback(() => {
    startStage(stageIndex, attempt + 1);
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

  let content: React.ReactNode = null;

  if (screen === 'loader') {
    content = <LoaderScreen onDone={goMenu} />;
  } else if (screen === 'menu') {
    content = (
      <MenuScreen
        progress={progress}
        onPlay={onPlay}
        onLevels={() => navigate('levelmap')}
        onMissions={() => navigate('missions')}
        onRewards={() => navigate('rewards')}
        onCollection={() => navigate('collection')}
        onTutorial={() => navigate('tutorial')}
        onSettings={() => navigate('settings')}
      />
    );
  } else if (screen === 'tutorial') {
    content = <TutorialScreen onBack={goMenu} onStartPlaying={onTutorialStart} />;
  } else if (screen === 'game') {
    content = (
      <GameScreen
        stageIndex={stageIndex}
        attempt={attempt}
        candyMarks={progress.settings.candyMarks}
        gentleMotion={gentle}
        hintPulse={progress.settings.hintPulse}
        onGameOver={onGameOver}
        onMenu={goMenu}
        onHowTo={() => navigate('tutorial')}
      />
    );
  } else if (screen === 'result' && report) {
    content = (
      <ResultScreen
        report={report}
        gentleMotion={gentle}
        hasNext={hasNextStage(report.stageIndex, progress.stageStars, bloomCount(progress.bloomed))}
        onPlayAgain={onPlayAgain}
        onNextStage={onNextStage}
        onMenu={goMenu}
        onCollection={() => navigate('collection')}
      />
    );
  } else if (screen === 'levelmap') {
    content = (
      <LevelMapScreen progress={progress} onBack={goMenu} onPlayStage={onPlayStage} />
    );
  } else if (screen === 'missions') {
    content = <MissionsScreen progress={progress} onBack={goMenu} />;
  } else if (screen === 'rewards') {
    content = <RewardsScreen progress={progress} onBack={goMenu} />;
  } else if (screen === 'collection') {
    content = <CollectionScreen progress={progress} onBack={goMenu} />;
  } else if (screen === 'settings') {
    content = <SettingsScreen progress={progress} onBack={goMenu} onReset={goMenu} />;
  } else {
    content = (
      <MenuScreen
        progress={progress}
        onPlay={onPlay}
        onLevels={() => navigate('levelmap')}
        onMissions={() => navigate('missions')}
        onRewards={() => navigate('rewards')}
        onCollection={() => navigate('collection')}
        onTutorial={() => navigate('tutorial')}
        onSettings={() => navigate('settings')}
      />
    );
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
