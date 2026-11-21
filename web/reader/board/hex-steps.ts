// The hexes about a hex, with nothing of the drawing: read by the board and by what the page knows of it without
// loading the board (BoardModel, in the page's own script: see BoardField).
export class HexSteps {
  private static readonly steps = [[[1, 0], [-1, 0], [0, -1], [-1, -1], [0, 1], [-1, 1]],
    [[1, 0], [-1, 0], [1, -1], [0, -1], [1, 1], [0, 1]]];
  static neighbours(width: number, height: number, i: number): number[] {
    const x = i % width, y = Math.floor(i / width);
    return HexSteps.steps[y % 2]!.map(([dx, dy]) => [x + dx!, y + dy!])
      .filter(([a, b]) => a! >= 0 && a! < width && b! >= 0 && b! < height).map(([a, b]) => b! * width + a!);
  }
}
