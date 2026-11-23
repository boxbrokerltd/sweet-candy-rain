import React, { memo } from 'react';
import { ImageBackground, StatusBar, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { theme } from '../constants/theme';

export type ShellVariant =
  | 'loader'
  | 'menu'
  | 'game'
  | 'result'
  | 'levelmap'
  | 'collection'
  | 'rewards'
  | 'missions'
  | 'settings'
  | 'tutorial'
  | 'daily';

const GRADIENTS: Record<ShellVariant, string[]> = {
  loader: theme.gradients.loader as unknown as string[],
  menu: theme.gradients.menu as unknown as string[],
  game: theme.gradients.game as unknown as string[],
  result: theme.gradients.result as unknown as string[],
  levelmap: theme.gradients.levelmap as unknown as string[],
  collection: theme.gradients.collection as unknown as string[],
  rewards: theme.gradients.rewards as unknown as string[],
  missions: theme.gradients.missions as unknown as string[],
  settings: theme.gradients.settings as unknown as string[],
  tutorial: theme.gradients.tutorial as unknown as string[],
  daily: theme.gradients.daily as unknown as string[],
};

/** The loader is deliberately dark; every other screen keeps the blush base. */
const OPACITY: Record<ShellVariant, number> = {
  loader: 0.94,
  menu: 0.96,
  game: 0.92,
  result: 0.95,
  levelmap: 0.95,
  collection: 0.95,
  rewards: 0.95,
  missions: 0.95,
  settings: 0.96,
  tutorial: 0.95,
  daily: 0.95,
};

type Props = {
  variant: ShellVariant;
  tint?: string;
  children?: React.ReactNode;
};

/**
 * Background stack shared by every screen: bg_game image -> gradient veil ->
 * optional world tint -> content. Three depth layers, one asset.
 */
function AppShellBase({ variant, tint, children }: Props) {
  const dark = variant === 'loader';
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground source={assets.bgGame} style={styles.bg} resizeMode="cover">
        <LinearGradient
          colors={GRADIENTS[variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { opacity: OPACITY[variant] }]}
        />
        {tint ? (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: tint, opacity: 0.05 }]} />
        ) : null}
        <View style={styles.content} pointerEvents="box-none">
          {children}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  bg: { flex: 1 },
  content: { flex: 1 },
});

export const AppShell = memo(AppShellBase);
export default AppShell;
