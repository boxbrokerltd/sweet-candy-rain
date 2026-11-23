import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RAIN_CAP, TIMING, stageConfig } from '../constants/config';
import {
  Board,
  EMPTY,
  collapse,
  floodFill,
  generateBoard,
  placeRainbow,
  popCells,
} from '../game/board';
import { addCharge, applyRainCrust, earnsRainbow, isRainReady, planCandyRain, planRainbowDrop } from '../game/boosters';
import { mulberry32, Rng, seedFor } from '../game/rng';
import { Outcome, evaluateRound, scoreForGroup, starsFor } from '../game/rules';
import { StageReport, progressStore } from '../game/progressStore';

export type EngineStatus = 'idle' | 'busy' | 'win' | 'lose';

export type EngineStats = {
  score: number;
  moves: number;
  spoils: number;
  crustCleared: number;
  rainCharge: number;
  groups: number;
  rains: number;
  rainbows: number;
};

type Pending = { fn: () => void; ms: number } | null;

export type GameEngine = {
  board: Board;
  stats: EngineStats;
  status: EngineStatus;
  outcome: Outcome | null;
  poppingIds: number[];
  spoilId: number;
  seed: number;
  tapCell: (index: number) => void;
  dropRain: () => void;
  pause: () => void;
  resume: () => void;
  rainReady: boolean;
};

export function useGameEngine(
  stageIndex: number,
  attempt: number,
  gentleMotion: boolean,
  onFinish: (report: StageReport) => void,
  /** Daily Challenge runs the same stage on its own tighter move budget. */
  movesOverride?: number,
): GameEngine {
  const base = useMemo(() => stageConfig(stageIndex), [stageIndex]);
  const cfg = useMemo(
    () => (movesOverride && movesOverride > 0 ? { ...base, moves: movesOverride } : base),
    [base, movesOverride],
  );
  const generated = useMemo(() => generateBoard(cfg, attempt), [cfg, attempt]);

  const [board, setBoard] = useState<Board>(generated.board);
  const [stats, setStats] = useState<EngineStats>({
    score: 0,
    moves: cfg.moves,
    spoils: 0,
    crustCleared: 0,
    rainCharge: 0,
    groups: 0,
    rains: 0,
    rainbows: 0,
  });
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [poppingIds, setPoppingIds] = useState<number[]>([]);
  const [spoilId, setSpoilId] = useState<number>(0);

  /* Callbacks read live data from refs, never from a captured render value. */
  const boardRef = useRef<Board>(generated.board);
  const statsRef = useRef<EngineStats>(stats);
  const busyRef = useRef(false);
  const doneRef = useRef(false);
  const pausedRef = useRef(false);
  const pendingRef = useRef<Pending>(null);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const rngRef = useRef<Rng>(mulberry32(seedFor(stageIndex, attempt) ^ 0x5f3a));
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const fallMs = gentleMotion ? TIMING.fallGentle : TIMING.fall;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current.clear();
  }, []);

  const schedule = useCallback(
    (fn: () => void, ms: number) => {
      if (pausedRef.current) {
        pendingRef.current = { fn, ms };
        return;
      }
      pendingRef.current = { fn, ms };
      const id = setTimeout(() => {
        timersRef.current.delete(id);
        pendingRef.current = null;
        fn();
      }, ms);
      timersRef.current.add(id);
    },
    [],
  );

  /* Fresh stage whenever the stage or the attempt changes. */
  useEffect(() => {
    clearTimers();
    pendingRef.current = null;
    busyRef.current = false;
    doneRef.current = false;
    pausedRef.current = false;
    rngRef.current = mulberry32(seedFor(stageIndex, attempt) ^ 0x5f3a);
    boardRef.current = generated.board;
    // A claimed 15*/24* chest starts the stage with half the rain meter filled.
    const headStart = progressStore.consumeHeadStart();
    const fresh: EngineStats = {
      score: 0,
      moves: cfg.moves,
      spoils: 0,
      crustCleared: 0,
      rainCharge: headStart ? RAIN_CAP / 2 : 0,
      groups: 0,
      rains: 0,
      rainbows: 0,
    };
    statsRef.current = fresh;
    setBoard(generated.board);
    setStats(fresh);
    setStatus('idle');
    setOutcome(null);
    setPoppingIds([]);
    setSpoilId(0);
  }, [generated, cfg, stageIndex, attempt, clearTimers]);

  /* Nothing keeps running once the screen is gone. */
  useEffect(() => {
    return () => {
      clearTimers();
      pendingRef.current = null;
    };
  }, [clearTimers]);

  const finish = useCallback(
    (result: Outcome) => {
      if (doneRef.current) return;
      doneRef.current = true;
      busyRef.current = true;
      const live = statsRef.current;
      const stars = starsFor(result, live.moves);
      setOutcome(result);
      setStatus(result === 'harvest' ? 'win' : 'lose');
      const report: StageReport = {
        stageIndex,
        outcome: result,
        score: live.score,
        crustCleared: live.crustCleared,
        movesLeft: live.moves,
        groups: live.groups,
        rains: live.rains,
        rainbows: live.rainbows,
        stars,
        seedsEarned: 0,
        tokensEarned: 0,
        advanced: [],
      };
      const handoff = result === 'harvest' ? TIMING.winHandoff : TIMING.loseHandoff;
      schedule(() => finishRef.current(report), handoff);
    },
    [schedule, stageIndex],
  );

  const settle = useCallback(() => {
    busyRef.current = false;
    setStatus('idle');
    const result = evaluateRound(statsRef.current, cfg);
    if (result) finish(result);
  }, [cfg, finish]);

  const applyPop = useCallback(
    (cells: number[], rainbowAt: number, movesSpent: number, extra: Partial<EngineStats>) => {
      const popIds = cells.map(i => boardRef.current[i].id).filter(id => id > 0);
      busyRef.current = true;
      setStatus('busy');
      setPoppingIds(popIds);

      schedule(() => {
        const popped = popCells(boardRef.current, cells);
        let next: Board = popped.board;
        if (rainbowAt >= 0) next = placeRainbow(next, rainbowAt);
        next = collapse(next, rngRef.current);

        const live = statsRef.current;
        const gained = scoreForGroup(cells.length);
        const updated: EngineStats = {
          ...live,
          ...extra,
          score: live.score + gained,
          moves: Math.max(0, live.moves - movesSpent),
          crustCleared: live.crustCleared + popped.crustCleared + (extra.crustCleared || 0),
          rainCharge: addCharge(live.rainCharge, cells.length),
          groups: live.groups + 1,
          rains: live.rains + (extra.rains || 0),
          rainbows: live.rainbows + (extra.rainbows || 0),
        };
        if (extra.rainCharge !== undefined) updated.rainCharge = extra.rainCharge;

        boardRef.current = next;
        statsRef.current = updated;
        setBoard(next);
        setStats(updated);
        setPoppingIds([]);

        schedule(settle, fallMs);
      }, TIMING.pop);
    },
    [fallMs, schedule, settle],
  );

  const tapCell = useCallback(
    (index: number) => {
      if (busyRef.current || pausedRef.current || doneRef.current) return;
      const b = boardRef.current;
      const cell = b[index];
      if (!cell || cell.color === EMPTY) return;

      if (cell.rainbow) {
        const cells = planRainbowDrop(b, index);
        applyPop(cells, -1, 1, { rainbows: 1 });
        return;
      }

      if (cell.crust > 0) {
        // Frosted candies cannot be popped - shake, but no spoil.
        busyRef.current = true;
        setSpoilId(cell.id);
        schedule(() => {
          setSpoilId(0);
          busyRef.current = false;
        }, TIMING.spoil);
        return;
      }

      const group = floodFill(b, index);
      if (group.length >= 2) {
        applyPop(group, earnsRainbow(group.length) ? index : -1, 1, {});
        return;
      }

      // A lone candy spoils: three spoils end the stage.
      busyRef.current = true;
      setSpoilId(cell.id);
      const live = statsRef.current;
      const updated = { ...live, spoils: live.spoils + 1 };
      statsRef.current = updated;
      setStats(updated);
      schedule(() => {
        setSpoilId(0);
        busyRef.current = false;
        const result = evaluateRound(statsRef.current, cfg);
        if (result) finish(result);
      }, TIMING.spoil);
    },
    [applyPop, cfg, finish, schedule],
  );

  const dropRain = useCallback(() => {
    if (busyRef.current || pausedRef.current || doneRef.current) return;
    const live = statsRef.current;
    if (!isRainReady(live.rainCharge)) return;

    const plan = planCandyRain(boardRef.current, 3);
    const crusted = applyRainCrust(boardRef.current, plan.crustHits);
    boardRef.current = crusted.board;
    // Candy rain costs no move and resets the charge.
    applyPop(plan.popCells, -1, 0, {
      rains: 1,
      rainCharge: 0,
      crustCleared: crusted.cleared,
    });
  }, [applyPop]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    clearTimers();
  }, [clearTimers]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) schedule(pending.fn, pending.ms);
  }, [schedule]);

  return {
    board,
    stats,
    status,
    outcome,
    poppingIds,
    spoilId,
    seed: generated.seed,
    tapCell,
    dropRain,
    pause,
    resume,
    rainReady: isRainReady(stats.rainCharge),
  };
}

export default useGameEngine;
