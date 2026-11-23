/**
 * Preset CANDY_SWEET (design-system/presets.ts, key 'candy-sweet').
 * Only two accent colours were added (garden mint + reward amber);
 * the preset name is kept verbatim.
 */
export const theme = {
  name: 'candy-sweet',
  presetKey: 'candy-sweet',

  colors: {
    bg: '#FFF0F5',
    surface: '#FFFFFF',
    surfaceAlt: '#F8E8F0',
    surfaceDeep: '#FFE0EB',
    primary: '#FF69B4',
    secondary: '#9B59B6',
    success: '#5FD3A6',
    reward: '#FFA23A',
    danger: '#FF5E7A',
    text: '#4A1E3D',
    textSoft: '#8A6B82',
    textMuted: '#B9A2B4',
    onAccent: '#FFFFFF',
    border: '#F3DCE8',
    disabled: '#E3C9D8',
    plateTint: '#D8A6C4',
  },

  gradients: {
    primary: ['#FF69B4', '#9B59B6'],
    grape: ['#9B59B6', '#6A2057'],
    mint: ['#5FD3A6', '#3FAE86'],
    amber: ['#FFCE3A', '#FFA23A'],
    rain: ['#FF69B4', '#FFCE3A'],
    loader: ['#3A0F2E', '#6A2057', '#9B59B6'],
    menu: ['#FFF0F5', '#FFE0EB', '#F8E8F0'],
    game: ['#FFE0EB', '#FFF0F5', '#F8E8F0'],
    result: ['#FFE0EB', '#FFC7E4', '#F8E8F0'],
    levelmap: ['#F8E8F0', '#FFF0F5', '#F8E8F0'],
    collection: ['#F0FBF6', '#FFF0F5', '#F8E8F0'],
    rewards: ['#FFF6EA', '#FFF0F5', '#F8E8F0'],
    missions: ['#F0F5FF', '#FFF0F5', '#F8E8F0'],
    settings: ['#FAF4F8', '#F8E8F0', '#FFF0F5'],
    tutorial: ['#FFF0F5', '#F8E8F0', '#FFE0EB'],
    daily: ['#FFF4F8', '#FFE6F0', '#F3E8FA'],
  },

  radius: { sm: 12, md: 18, lg: 24, xl: 28, xxl: 32, pill: 100 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },

  type: {
    hero: { fontSize: 36, fontWeight: '800' as const, letterSpacing: 1 },
    title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 0.5 },
    section: { fontSize: 18, fontWeight: '800' as const, letterSpacing: 1 },
    body: { fontSize: 15, fontWeight: '500' as const, lineHeight: 21 },
    caption: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.4 },
    number: { fontSize: 22, fontWeight: '800' as const },
  },

  shadow: {
    clay: {
      shadowColor: '#D8A6C4',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 18,
      elevation: 6,
    },
    deep: {
      shadowColor: '#D8A6C4',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 9,
    },
    cta: {
      shadowColor: '#FF69B4',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.42,
      shadowRadius: 22,
      elevation: 10,
    },
    soft: {
      shadowColor: '#D8A6C4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 3,
    },
  },

  anim: {
    press: { tension: 180, friction: 12 },
    pop: { tension: 200, friction: 9 },
    fade: 240,
    loaderFade: 300,
  },
} as const;

/** The five candy colours. The mark glyphs are the allowed set only. */
export const CANDY_COLORS = ['#FF5E7A', '#FFCE3A', '#9B59B6', '#5FD3A6', '#5B8FF9'];
export const CANDY_MARKS = ['♥', '★', '✓', '·', '✗'];
export const CANDY_NAMES = ['STRAWBERRY', 'LEMON', 'GRAPE', 'MINT', 'BLUEBERRY'];

export type Theme = typeof theme;
export default theme;
