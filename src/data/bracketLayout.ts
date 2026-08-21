export type BracketPosition = { x: number; y: number };

export const bracketCanvas = { width: 2200, height: 1220, cardWidth: 190, cardHeight: 90 };

// U.S. advances left-to-center, International advances right-to-center.
export const bracketPositions: Record<number, BracketPosition> = {
  1: { x: 1970, y: 210 }, 2: { x: 40, y: 210 }, 3: { x: 1970, y: 350 }, 4: { x: 40, y: 350 },
  5: { x: 1970, y: 70 }, 6: { x: 40, y: 70 }, 7: { x: 1970, y: 490 }, 8: { x: 40, y: 490 },
  9: { x: 1740, y: 210 }, 10: { x: 270, y: 210 }, 11: { x: 1740, y: 350 }, 12: { x: 270, y: 350 },
  13: { x: 1970, y: 700 }, 14: { x: 40, y: 700 }, 15: { x: 1970, y: 1020 }, 16: { x: 40, y: 1020 },
  17: { x: 500, y: 140 }, 18: { x: 1510, y: 140 }, 19: { x: 500, y: 420 }, 20: { x: 1510, y: 420 },
  21: { x: 1740, y: 700 }, 22: { x: 270, y: 700 }, 23: { x: 1740, y: 1020 }, 24: { x: 270, y: 1020 },
  25: { x: 1510, y: 1020 }, 26: { x: 500, y: 1020 }, 27: { x: 1510, y: 700 }, 28: { x: 500, y: 700 },
  29: { x: 1280, y: 280 }, 30: { x: 730, y: 280 }, 31: { x: 1360, y: 860 }, 32: { x: 650, y: 860 },
  33: { x: 1160, y: 860 }, 34: { x: 850, y: 860 }, 35: { x: 1160, y: 530 }, 36: { x: 850, y: 530 },
  37: { x: 1005, y: 1030 }, 38: { x: 1005, y: 650 },
};
