export enum CELL_STATUS {
  EMPTY = 0,
  WHITE = 1,
  BLACK = 2,
}
export class Board {
  public state!: number[][];

  constructor() {
    this.state = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 2, 0, 0, 0],
      [0, 0, 0, 2, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];
  }

  public setState(state: number[][]) {
    this.state = state;
  }

  // return the sum of all cells
  public getSum(): number {
    return this.state.reduce((s, e) => s + e.reduce((s2, e2) => s2 + e2, 0), 0);
  }

  public countOccurencesOf(player: CELL_STATUS): number {
    return this.state.reduce(
      (sum, row) => sum + row.reduce((s, e) => (e === player ? ++s : s), 0),
      0,
    );
  }

  public getCell(i: number, j: number) {
    return this.state[i][j];
  }

  public setToZero() {
    this.state = Array(8)
      .fill(0)
      .map(() => Array(8).fill(0));
  }

  public getColumn(i: number): number[] {
    const column = [];
    for (const col of this.state) {
      column.push(col[i]);
    }
    return column;
  }

  public getMirrorDiagonals(): number[][] {
    const board = new Board();
    board.setState(this.getReversedRows());
    return board.getDiagonals();
  }

  // get top-left ---> down-right diagonals
  public getDiagonals(): number[][] {
    const res = [];
    const arr = this.state;
    const l = arr.length;
    // get the upper right diagonals
    for (let i = 1; i < l; i++) {
      const diag = [];
      for (let j = 0; j < i; j++) {
        diag.push(arr[j][l - i + j]);
      }
      res.push(diag);
    }
    {
      // get the middle diagonal
      const diag = [];
      for (let i = 0; i < l; i++) {
        diag.push(arr[i][i]);
      }
      res.push(diag);
    }
    // get the lower left diagonals
    for (let i = l - 1; i >= 1; i--) {
      const diag = [];
      for (let j = i - 1; j >= 0; j--) {
        diag.push(arr[l - i + j][j]);
      }
      res.push(diag.reverse());
    }
    return res;
  }

  /**
   * flip discs in a one dimensional array
   * @example
   * // returns [0,1,1,1,1,1,2,0]
   * flipDiscs([0,1,1,2,2,1,2,0], 2, 1)
   */
  public flipDiscs(row: number[], player: number, opponent: number): number[] {
    let playerStarted = -1;
    let opponentStarted = -1;
    // TODO: find a simpler way to do this
    for (let j = 0; j < row.length; j++) {
      switch (row[j]) {
        case player:
          if (playerStarted >= 0 && opponentStarted >= 0) {
            for (let k = playerStarted; k <= opponentStarted; k++) {
              row[k] = player;
            }
          }
          playerStarted = j;
          break;
        case CELL_STATUS.EMPTY:
          playerStarted = -1;
          opponentStarted = -1;
          break;
        case opponent:
          opponentStarted = j;
          break;
      }
    }
    return row;
  }

  public setColumn(arr: number[], i: number): void {
    for (let j = 0; j < this.state.length; j++) {
      this.state[j][i] = arr[j];
    }
  }

  public flip(i: number, j: number, player: number, opponent: number) {
    const length = this.state.length;
    this.state[i][j] = player;
    // flip rows
    this.state[i] = this.flipDiscs(this.state[i], player, opponent);
    // flip columns
    this.setColumn(this.flipDiscs(this.getColumn(j), player, opponent), j);

    {
      // flip top-left->down-right diagonal
      const position = this.state.length + (i - j) - 1;
      const diagonal = this.getDiagonals()[position];
      this.setDiagonal(
        this.flipDiscs(diagonal, player, opponent),
        position + 1,
      );
    }
    {
      // flip top-left->down-right diagonal
      const position = i + j;
      const diagonal = this.getMirrorDiagonals()[position];
      this.setMirrorDiagonal(
        this.flipDiscs(diagonal, player, opponent),
        position + 1,
      );
    }
  }

  public setMirrorDiagonal(arr: number[], i: number): void {
    this.reverseRows();
    this.setDiagonal(arr, i);
    this.reverseRows();
  }

  public setDiagonal(arr2: number[], i: number): void {
    const arr = this.state;
    const l = arr.length;
    // NOTE: there may be a better way to set everything in one loop
    if (i < l) {
      for (let j = 0; j < i; j++) {
        arr[j][l - i + j] = arr2[j];
      }
    }
    if (i === l) {
      for (let k = 0; k < l; k++) {
        arr[k][k] = arr2[k];
      }
    }
    if (i > l) {
      for (let j = 0; i - l + j < l; j++) {
        arr[i - l + j][j] = arr2[j];
      }
    }
  }

  public reverseRows() {
    this.state = this.state.map((a) => a.slice().reverse());
  }

  public getReversedRows(): number[][] {
    return this.state.map((a) => a.slice().reverse());
  }
}
