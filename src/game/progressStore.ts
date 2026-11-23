import { CHESTS, TOTAL_STAGES } from '../constants/config';
import { DailyState, EMPTY_DAILY, completeDaily as advanceDaily } from './daily';
import { MissionState, drawMissions } from '../constants/missions';
import { PLANTS } from '../constants/plants';
import { grant, seedsForStars, spend, tokensForScore } from './economy';
import { bloomCount, clearedCount, totalStars } from './progression';
import { Outcome } from './rules';

export type Settings = {
  candyMarks: boolean;
  gentleMotion: boolean;
  hintPulse: boolean;
};

export type Totals = {
  score: number;
  crust: number;
  groups: number;
  rains: number;
  rainbows: number;
  stars: number;
};

export type ProgressSnapshot = {
  version: number;
  stageStars: number[];
  seeds: number;
  tokens: number;
  bloomed: boolean[];
  missions: MissionState[];
  missionRound: number;
  chestsClaimed: boolean[];
  headStart: boolean;
  tutorialSeen: boolean;
  daily: DailyState;
  settings: Settings;
  totals: Totals;
};

export type StageReport = {
  stageIndex: number;
  outcome: Outcome;
  score: number;
  crustCleared: number;
  movesLeft: number;
  groups: number;
  rains: number;
  rainbows: number;
  stars: number;
  seedsEarned: number;
  tokensEarned: number;
  advanced: { title: string; cur: number; target: number }[];
};

export const DEFAULT_SETTINGS: Settings = {
  candyMarks: true,
  gentleMotion: false,
  hintPulse: true,
};

export function defaultProgress(): ProgressSnapshot {
  return {
    version: 1,
    stageStars: new Array(TOTAL_STAGES).fill(0),
    seeds: 0,
    tokens: 0,
    bloomed: new Array(PLANTS.length).fill(false),
    missions: drawMissions(0),
    missionRound: 0,
    chestsClaimed: new Array(CHESTS.length).fill(false),
    headStart: false,
    tutorialSeen: false,
    daily: { ...EMPTY_DAILY },
    settings: { ...DEFAULT_SETTINGS },
    totals: { score: 0, crust: 0, groups: 0, rains: 0, rainbows: 0, stars: 0 },
  };
}

type Listener = () => void;

/**
 * Single source of truth for everything that survives a screen switch.
 * serialize()/hydrate() is the whole persistence seam: attaching a storage
 * backend later is a one-file change, no screen is touched.
 */
class ProgressStore {
  private state: ProgressSnapshot = defaultProgress();
  private listeners = new Set<Listener>();

  getState = (): ProgressSnapshot => this.state;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private commit(next: ProgressSnapshot): void {
    this.state = next;
    this.listeners.forEach(l => l());
  }

  serialize = (): ProgressSnapshot => JSON.parse(JSON.stringify(this.state));

  hydrate = (snapshot: Partial<ProgressSnapshot> | null | undefined): void => {
    const base = defaultProgress();
    if (!snapshot) {
      this.commit(base);
      return;
    }
    this.commit({
      ...base,
      ...snapshot,
      settings: { ...base.settings, ...(snapshot.settings || {}) },
      daily: { ...base.daily, ...(snapshot.daily || {}) },
      totals: { ...base.totals, ...(snapshot.totals || {}) },
      stageStars: (snapshot.stageStars || base.stageStars).slice(0, TOTAL_STAGES),
      bloomed: (snapshot.bloomed || base.bloomed).slice(0, PLANTS.length),
      chestsClaimed: (snapshot.chestsClaimed || base.chestsClaimed).slice(0, CHESTS.length),
      missions: snapshot.missions && snapshot.missions.length === 3 ? snapshot.missions : base.missions,
    });
  };

  reset = (): void => {
    this.commit(defaultProgress());
  };

  setSetting = <K extends keyof Settings>(key: K, value: Settings[K]): void => {
    this.commit({ ...this.state, settings: { ...this.state.settings, [key]: value } });
  };

  markTutorialSeen = (): void => {
    if (this.state.tutorialSeen) return;
    this.commit({ ...this.state, tutorialSeen: true });
  };

  /** Marks today's Daily Challenge as finished and advances the streak. */
  completeDaily = (now: Date = new Date()): DailyState => {
    const next = advanceDaily(this.state.daily, now);
    if (next !== this.state.daily) {
      this.commit({ ...this.state, daily: next });
    }
    return next;
  };

  consumeHeadStart = (): boolean => {
    if (!this.state.headStart) return false;
    this.commit({ ...this.state, headStart: false });
    return true;
  };

  /** Applies one finished stage: stars, seeds, tokens, totals and missions. */
  finishStage = (report: StageReport): StageReport => {
    const s = this.state;
    const stageStars = s.stageStars.slice();
    const best = Math.max(stageStars[report.stageIndex] || 0, report.stars);
    const gainedStars = Math.max(0, best - (stageStars[report.stageIndex] || 0));
    stageStars[report.stageIndex] = best;

    const seedsEarned = seedsForStars(report.stars);
    const tokensEarned = tokensForScore(report.score);

    const totals: Totals = {
      score: s.totals.score + report.score,
      crust: s.totals.crust + report.crustCleared,
      groups: s.totals.groups + report.groups,
      rains: s.totals.rains + report.rains,
      rainbows: s.totals.rainbows + report.rainbows,
      stars: s.totals.stars + gainedStars,
    };

    const advanced: StageReport['advanced'] = [];
    const missions = s.missions.map(m => {
      if (m.claimed) return m;
      let add = 0;
      if (m.def.kind === 'score') add = report.score;
      else if (m.def.kind === 'crust') add = report.crustCleared;
      else if (m.def.kind === 'groups') add = report.groups;
      else if (m.def.kind === 'rain') add = report.rains;
      else if (m.def.kind === 'rainbow') add = report.rainbows;
      else if (m.def.kind === 'stars') add = report.stars;
      if (add <= 0) return m;
      const progress = Math.min(m.def.target, m.progress + add);
      if (progress !== m.progress) {
        advanced.push({ title: m.def.title, cur: progress, target: m.def.target });
      }
      return { ...m, progress };
    });

    this.commit({
      ...s,
      stageStars,
      seeds: grant(s.seeds, seedsEarned),
      tokens: grant(s.tokens, tokensEarned),
      totals,
      missions,
    });

    return { ...report, seedsEarned, tokensEarned, advanced: advanced.slice(0, 2) };
  };

  claimMission = (missionId: string): boolean => {
    const s = this.state;
    const index = s.missions.findIndex(m => m.def.id === missionId);
    if (index < 0) return false;
    const mission = s.missions[index];
    if (mission.claimed || mission.progress < mission.def.target) return false;

    const missions = s.missions.slice();
    missions[index] = { ...mission, claimed: true };
    const allClaimed = missions.every(m => m.claimed);
    const missionRound = allClaimed ? s.missionRound + 1 : s.missionRound;

    this.commit({
      ...s,
      missions: allClaimed ? drawMissions(missionRound) : missions,
      missionRound,
      seeds: grant(s.seeds, mission.def.seeds),
      tokens: grant(s.tokens, mission.def.tokens),
    });
    return true;
  };

  claimChest = (chestId: number): boolean => {
    const s = this.state;
    const chest = CHESTS[chestId];
    if (!chest || s.chestsClaimed[chestId]) return false;
    if (totalStars(s.stageStars) < chest.stars) return false;

    const chestsClaimed = s.chestsClaimed.slice();
    chestsClaimed[chestId] = true;
    this.commit({
      ...s,
      chestsClaimed,
      seeds: grant(s.seeds, chest.seeds),
      tokens: grant(s.tokens, chest.tokens),
      headStart: s.headStart || chest.headStart,
    });
    return true;
  };

  plant = (plantId: number): boolean => {
    const s = this.state;
    const def = PLANTS[plantId];
    if (!def || s.bloomed[plantId] || s.seeds < def.cost) return false;
    const bloomed = s.bloomed.slice();
    bloomed[plantId] = true;
    this.commit({ ...s, bloomed, seeds: spend(s.seeds, def.cost) });
    return true;
  };
}

export const progressStore = new ProgressStore();

/* Derived helpers used by the screens. */
export const selectStars = (s: ProgressSnapshot) => totalStars(s.stageStars);
export const selectBlooms = (s: ProgressSnapshot) => bloomCount(s.bloomed);
export const selectCleared = (s: ProgressSnapshot) => clearedCount(s.stageStars);
export const selectMissionsDone = (s: ProgressSnapshot) =>
  s.missions.filter(m => m.progress >= m.def.target).length;
export const selectChestsReady = (s: ProgressSnapshot) => {
  const stars = totalStars(s.stageStars);
  let n = 0;
  for (let i = 0; i < CHESTS.length; i++) {
    if (!s.chestsClaimed[i] && stars >= CHESTS[i].stars) n += 1;
  }
  return n;
};
