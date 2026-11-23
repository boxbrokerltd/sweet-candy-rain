import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { RoundIconButton, SecondaryButton } from '../components/Buttons';
import { MissionCard } from '../components/Cards';
import { EmptyState, Pill } from '../components/Common';
import { ScreenHeader } from '../components/ScreenHeader';
import { ArrowLeft, ListChecks, Sparkles } from '../components/icons';
import { theme } from '../constants/theme';
import { ProgressSnapshot, progressStore } from '../game/progressStore';

type Props = {
  progress: ProgressSnapshot;
  onBack: () => void;
};

const TINTS = ['#5B8FF9', '#FF69B4', '#9B59B6'];

export default function MissionsPanel({ progress, onBack }: Props) {
  const done = progress.missions.filter(m => m.progress >= m.def.target).length;
  const allClaimed = progress.missions.every(m => m.claimed);
  const anyProgress = progress.missions.some(m => m.progress > 0);

  const claim = useCallback((id: string) => {
    progressStore.claimMission(id);
  }, []);

  return (
    <AppShell variant="missions">
      <ScreenHeader
        title="MISSIONS"
        leftSlot={<RoundIconButton label="BACK" Icon={ArrowLeft} onPress={onBack} />}
        rightSlot={<Pill Icon={ListChecks} value={done + '/3'} tone="#5B8FF9" />}
      />

      <View style={styles.body} pointerEvents="box-none">
        {allClaimed ? (
          <EmptyState
            Icon={Sparkles}
            message="ALL MISSIONS CLAIMED - FINISH A STAGE FOR A FRESH SET"
          />
        ) : (
          <>
            {progress.missions.map((mission, i) => (
              <MissionCard
                key={mission.def.id}
                mission={mission}
                tint={TINTS[i % TINTS.length]}
                onClaim={() => claim(mission.def.id)}
              />
            ))}
            {anyProgress ? null : (
              <Text style={styles.note}>
                PLAY A STAGE TO START FILLING THESE MISSIONS
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.footer} pointerEvents="box-none">
        <SecondaryButton label="MENU" onPress={onBack} height={48} tone={theme.colors.secondary} />
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, gap: 12 },
  note: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: theme.colors.textSoft,
  },
  footer: { paddingHorizontal: 20, paddingBottom: 22 },
});
