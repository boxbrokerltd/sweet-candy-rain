import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { RoundIconButton, SecondaryButton } from '../components/Buttons';
import { Pill } from '../components/Common';
import { LevelNode } from '../components/LevelNode';
import { ScreenHeader } from '../components/ScreenHeader';
import { ArrowLeft, Star } from '../components/icons';
import { WORLDS } from '../constants/config';
import { theme } from '../constants/theme';
import {
  bloomCount,
  isStageUnlocked,
  lockReason,
  nodeState,
  totalStars,
} from '../game/progression';
import { ProgressSnapshot } from '../game/progressStore';

type Props = {
  progress: ProgressSnapshot;
  onBack: () => void;
  onPlayStage: (stageIndex: number) => void;
};

export default function PuzzleMapPanel({ progress, onBack, onPlayStage }: Props) {
  const blooms = bloomCount(progress.bloomed);
  const stars = totalStars(progress.stageStars);
  const [toast, setToast] = useState('');
  const toastFade = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback(
    (message: string) => {
      setToast(message);
      toastFade.setValue(1);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      Animated.timing(toastFade, {
        toValue: 0,
        duration: 400,
        delay: 1800,
        useNativeDriver: true,
      }).start();
      toastTimer.current = setTimeout(() => setToast(''), 2300);
    },
    [toastFade],
  );

  const tapNode = useCallback(
    (stageIndex: number) => {
      if (isStageUnlocked(stageIndex, progress.stageStars, blooms)) {
        onPlayStage(stageIndex);
        return;
      }
      showToast(lockReason(stageIndex, progress.stageStars, blooms) + ' TO UNLOCK STAGE ' + (stageIndex + 1));
    },
    [blooms, onPlayStage, progress.stageStars, showToast],
  );

  return (
    <AppShell variant="levelmap">
      <ScreenHeader
        title="LEVEL MAP"
        leftSlot={<RoundIconButton label="BACK" Icon={ArrowLeft} onPress={onBack} />}
        rightSlot={<Pill Icon={Star} value={String(stars)} tone={theme.colors.reward} />}
      />

      <View style={styles.bands} pointerEvents="box-none">
        {WORLDS.map((world, w) => {
          const first = world.first;
          const indices = [first, first + 1, first + 2, first + 3];
          const cleared = indices.filter(i => progress.stageStars[i] > 0).length;
          const bandStars = indices.reduce((acc, i) => acc + progress.stageStars[i], 0);

          return (
            <View key={world.name} style={styles.band} pointerEvents="box-none">
              <View style={styles.bandHead} pointerEvents="none">
                <View style={[styles.bandTint, { backgroundColor: world.tint }]} />
                <Text style={styles.bandName} numberOfLines={1}>
                  {world.name}
                </Text>
                <Text style={styles.bandMeta}>
                  {cleared + '/4 · ' + bandStars + '★'}
                </Text>
              </View>

              <View style={styles.path} pointerEvents="none" />

              <View style={styles.nodes} pointerEvents="box-none">
                {indices.map((stageIndex, k) => (
                  <View
                    key={stageIndex}
                    style={[styles.nodeSlot, k % 2 === 1 ? styles.nodeSlotLow : null]}>
                    <LevelNode
                      stage={stageIndex + 1}
                      state={nodeState(stageIndex, progress.stageStars, blooms)}
                      stars={progress.stageStars[stageIndex]}
                      tint={world.tint}
                      onPress={() => tapNode(stageIndex)}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>

      {toast ? (
        <Animated.View style={[styles.toast, { opacity: toastFade }]} pointerEvents="none">
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}

      <View style={styles.footer} pointerEvents="box-none">
        <SecondaryButton label="MENU" onPress={onBack} height={48} tone={theme.colors.secondary} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  bands: { flex: 1, paddingHorizontal: 16, gap: 10 },
  band: {
    borderRadius: theme.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
    ...theme.shadow.soft,
  },
  bandHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  bandTint: { width: 8, height: 8, borderRadius: 4 },
  bandName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: theme.colors.text,
  },
  bandMeta: { fontSize: 11, fontWeight: '800', color: theme.colors.textSoft },
  path: {
    position: 'absolute',
    left: 34,
    right: 34,
    top: 68,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E3C9D8',
  },
  nodes: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  nodeSlot: { alignItems: 'center', paddingTop: 4 },
  nodeSlotLow: { paddingTop: 22 },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 96,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radius.lg,
    backgroundColor: 'rgba(74,30,61,0.92)',
  },
  toastText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  footer: { paddingHorizontal: 20, paddingBottom: 22 },
});
