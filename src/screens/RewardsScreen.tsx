import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { RoundIconButton, SecondaryButton } from '../components/Buttons';
import { ChestCard } from '../components/Cards';
import { EmptyState, Pill } from '../components/Common';
import { ScreenHeader } from '../components/ScreenHeader';
import { ArrowLeft, Gift, Star } from '../components/icons';
import { CHESTS } from '../constants/config';
import { theme } from '../constants/theme';
import { totalStars } from '../game/progression';
import { ProgressSnapshot, progressStore } from '../game/progressStore';

type Props = {
  progress: ProgressSnapshot;
  onBack: () => void;
};

const TINTS = ['#FF69B4', '#FFA23A', '#9B59B6', '#5B8FF9'];

export default function RewardsScreen({ progress, onBack }: Props) {
  const stars = totalStars(progress.stageStars);
  const anyReady = CHESTS.some((c, i) => !progress.chestsClaimed[i] && stars >= c.stars);
  const nothingYet = stars === 0 && !anyReady;

  const claim = useCallback((id: number) => {
    progressStore.claimChest(id);
  }, []);

  return (
    <AppShell variant="rewards">
      <ScreenHeader
        title="REWARDS"
        leftSlot={<RoundIconButton label="BACK" Icon={ArrowLeft} onPress={onBack} />}
        rightSlot={<Pill Icon={Star} value={String(stars)} tone={theme.colors.reward} />}
      />

      <View style={styles.body} pointerEvents="box-none">
        {nothingYet ? (
          <EmptyState
            Icon={Gift}
            message="NO CHEST READY YET - EARN 3 STARS TO OPEN THE FIRST ONE"
          />
        ) : (
          <View style={styles.grid} pointerEvents="box-none">
            {CHESTS.map((chest, i) => (
              <ChestCard
                key={chest.id}
                chestId={chest.id}
                needStars={chest.stars}
                seeds={chest.seeds}
                tokens={chest.tokens}
                headStart={chest.headStart}
                stars={stars}
                claimed={progress.chestsClaimed[i]}
                tint={TINTS[i % TINTS.length]}
                onClaim={() => claim(chest.id)}
              />
            ))}
          </View>
        )}
      </View>

      <Text style={styles.footerNote}>{'ALL REWARDS ARE VIRTUAL · NO PURCHASES'}</Text>

      <View style={styles.footer} pointerEvents="box-none">
        <SecondaryButton label="MENU" onPress={onBack} height={48} tone={theme.colors.secondary} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  footerNote: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: theme.colors.textMuted,
    marginBottom: 10,
  },
  footer: { paddingHorizontal: 20, paddingBottom: 22 },
});
