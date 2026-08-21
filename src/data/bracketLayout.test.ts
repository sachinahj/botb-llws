import { describe, expect, it } from "vitest";
import { games } from "./games";
import { bracketCanvas, bracketPositions } from "./bracketLayout";

describe("mirrored bracket layout", () => {
  it("positions every game once inside the canvas", () => {
    expect(Object.keys(bracketPositions).map(Number).sort((a, b) => a - b)).toEqual(games.map((game) => game.id));

    const positions = Object.entries(bracketPositions);
    for (const [, position] of positions) {
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.x + bracketCanvas.cardWidth).toBeLessThanOrEqual(bracketCanvas.width);
      expect(position.y + bracketCanvas.cardHeight).toBeLessThanOrEqual(bracketCanvas.height);
    }

    for (const [index, [gameId, position]] of positions.entries()) {
      for (const [otherId, other] of positions.slice(index + 1)) {
        const overlaps = position.x < other.x + bracketCanvas.cardWidth
          && position.x + bracketCanvas.cardWidth > other.x
          && position.y < other.y + bracketCanvas.cardHeight
          && position.y + bracketCanvas.cardHeight > other.y;
        expect(overlaps, `Games ${gameId} and ${otherId} overlap`).toBe(false);
      }
    }
  });
});
