/**
 * ONE icon library for the whole project (lucide-react-native).
 * Every icon is SVG on a fixed canvas, so sizes never drift between buttons.
 */
export {
  ArrowLeft,
  CheckCircle2,
  Droplets,
  Eye,
  Gift,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Lock,
  Map,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Sprout,
  Star,
  Wind,
} from 'lucide-react-native';

import type { ComponentType } from 'react';

/** Shape every icon in this project satisfies (lucide forwardRef components). */
export type IconComp = ComponentType<any>;
