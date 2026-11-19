import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BOARD_BORDER_W,
  BOARD_H,
  BOARD_PADDING,
  BOARD_W,
  COLS,
  ROWS,
  TILE,
} from '../constants/config';
import { theme } from '../constants/theme';
import { Board } from '../game/board';
import { CandyTile } from './CandyTile';

type Props = {
  board: Board;
  poppingIds: number[];
  spoilId: number;
  hintCells: number[];
  marks: boolean;
  fallMs: number;
  dimmed: boolean;
  onTapCell: (index: number) => void;
};

function CandyBoardBase({
  board,
  poppingIds,
  spoilId,
  hintCells,
  marks,
  fallMs,
  dimmed,
  onTapCell,
}: Props) {
  const popSet = useMemo(() => new Set(poppingIds), [poppingIds]);
  const hintSet = useMemo(() => new Set(hintCells), [hintCells]);

  return (
    <View style={styles.frame}>
      <View style={styles.grid}>
        {board.map((cell, index) => (
          <CandyTile
            key={index}
            index={index}
            cell={cell}
            size={TILE}
            popping={popSet.has(cell.id)}
            spoiling={spoilId === cell.id}
            hinted={hintSet.has(index)}
            marks={marks}
            fallMs={fallMs}
            onPress={onTapCell}
          />
        ))}
      </View>
      {dimmed ? <View style={styles.veil} pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: BOARD_W,
    height: BOARD_H,
    padding: BOARD_PADDING,
    borderWidth: BOARD_BORDER_W,
    borderColor: '#F6D9E7',
    borderTopColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    alignSelf: 'center',
    overflow: 'hidden',
    ...theme.shadow.deep,
  },
  grid: {
    width: TILE * COLS,
    height: TILE * ROWS,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});

export const CandyBoard = memo(CandyBoardBase);
export default CandyBoard;
