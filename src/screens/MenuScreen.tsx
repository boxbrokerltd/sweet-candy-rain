import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { assets } from '../assets';
import { AppShell } from '../components/AppShell';
import { BentoTile, PlayTile } from '../components/BentoTile';
import { BlobDecor, CandyRainDecor } from '../components/Decor';
import { Pill } from '../components/Common';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  Droplets,
  Gift,
  HelpCircle,
  ListChecks,
  Map,
  Settings,
  Sprout,
  Star,
} from '../components/icons';
import { BRAND_NAME, TOTAL_STAGES, WORLDS, stageConfig } from '../constants/config';
import { theme } from '../constants/theme';
import { dailyFor, isDoneToday } from '../game/daily';
import { DISCLAIMER } from '../game/economy';
import {
  bloomCount,
  clearedCount,
  nextPlayableStage,
  totalStars,
} from '../game/progression';
import { ProgressSnapshot } from '../game/progressStore';
import { PLANTS } from '../constants/plants';

type Props = {
  progress: ProgressSnapshot;
  onPlay: () => void;
  onLevels: () => void;
  onDaily: () => void;
  onMissions: () => void;
  onRewards: () => void;
  onCollection: () => void;
  onTutorial: () => void;
  onSettings: () => void;
};

export default function MenuScreen({
  progress,
  onPlay,
  onLevels,
  onDaily,
  onMissions,
  onRewards,
  onCollection,
  onTutorial,
  onSettings,
}: Props) {
  const stars = totalStars(progress.stageStars);
  const blooms = bloomCount(progress.bloomed);
  const cleared = clearedCount(progress.stageStars);

  const nextStage = useMemo(
    () => nextPlayableStage(progress.stageStars, blooms),
    [progress.stageStars, blooms],
  );
  const world = WORLDS[stageConfig(nextStage).world];

  const today = useMemo(() => new Date(), []);
  const dailyDone = isDoneToday(progress.daily, today);
  const dailyTwist = useMemo(() => dailyFor(today).twist.title, [today]);

  const missionsDone = progress.missions.filter(m => m.progress >= m.def.target).length;
  const chestsReady = progress.chestsClaimed.reduce((acc, claimed, i) => {
    const need = [3, 8, 15, 24][i];
    return acc + (!claimed && stars >= need ? 1 : 0);
  }, 0);

  return (
    <AppShell variant="menu">
      <BlobDecor />
      <CandyRainDecor count={9} seed={777} opacity={0.5} />

      <ScreenHeader
        title={BRAND_NAME}
        leftSlot={
          <View style={styles.logoPlate}>
            <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
          </View>
        }
        rightSlot={
          <View style={styles.pills}>
            <Pill Icon={Sprout} value={String(progress.seeds)} tone={theme.colors.success} />
            <Pill Icon={Star} value={String(stars)} tone={theme.colors.reward} />
          </View>
        }
      />

      <View style={styles.grid} pointerEvents="box-none">
        <PlayTile
          stageLabel={'STAGE ' + (nextStage + 1)}
          worldName={world.name}
          onPress={onPlay}
        />

        <View style={styles.row} pointerEvents="box-none">
          <BentoTile
            label="LEVELS"
            Icon={Map}
            accent={theme.colors.secondary}
            value={cleared + '/' + TOTAL_STAGES}
            height={104}
            delay={60}
            onPress={onLevels}
          />
          <BentoTile
            label="CHALLENGE"
            Icon={Droplets}
            accent={theme.colors.primary}
            value={dailyDone ? 'DONE TODAY' : dailyTwist}
            height={104}
            delay={120}
            onPress={onDaily}
          />
        </View>

        <View style={styles.row} pointerEvents="box-none">
          <BentoTile
            label="REWARDS"
            Icon={Gift}
            accent={theme.colors.reward}
            value={chestsReady > 0 ? chestsReady + ' READY' : undefined}
            note={chestsReady > 0 ? undefined : 'EARN STARS'}
            height={104}
            delay={180}
            onPress={onRewards}
          />
          <BentoTile
            label="COLLECTION"
            Icon={Sprout}
            accent={theme.colors.success}
            value={blooms + '/' + PLANTS.length}
            height={104}
            delay={240}
            onPress={onCollection}
          />
        </View>

        <View style={styles.row} pointerEvents="box-none">
          <BentoTile
            label="MISSIONS"
            Icon={ListChecks}
            accent="#5B8FF9"
            note={missionsDone + '/3 DONE'}
            height={86}
            delay={300}
            onPress={onMissions}
          />
          <BentoTile
            label={progress.tutorialSeen ? 'TUTORIAL ✓' : 'TUTORIAL'}
            Icon={HelpCircle}
            accent={theme.colors.secondary}
            height={86}
            delay={340}
            onPress={onTutorial}
          />
          <BentoTile
            label="SETTINGS"
            Icon={Settings}
            accent="#8A6B82"
            height={86}
            delay={380}
            onPress={onSettings}
          />
        </View>
      </View>

      <Text style={styles.footer}>{DISCLAIMER}</Text>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  logoPlate: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.soft,
  },
  logo: { width: 34, height: 34 },
  pills: { flexDirection: 'row', gap: 6 },
  grid: { flex: 1, paddingHorizontal: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
    marginBottom: 16,
    marginTop: 8,
  },
});
