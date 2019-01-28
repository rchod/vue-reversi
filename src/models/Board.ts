export default class Board {
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
      [0, 0, 0, 0, 0, 0, 0, 0]
    ];
  }

  public getColumn(i: number): number[] {
    const column = [];
    for (let j = 0; j < this.state.length; j++) {
      column.push(this.state[j][i]);
    }
    return column;
  }

  // get top-left ---> down-right diagonals
  public getDiagonals(arr: number[][]): number[][] {
    const res = [];
    const l = arr.length;
    // get the upper right diagonals
    for (let i = 1; i < l; i++) {
      const diag = [];
      for (let j = 0; j < i; j++) {
        diag.push(arr[j][l - i + j]);
      }
      res.push(diag);
    }
    // get the middle diagonal
    const diag = [];
    for (let i = 0; i < l; i++) {
      diag.push(arr[i][i]);
    }
    res.push(diag);
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

  public flip(i: number, j: number, playerId: number, opponent: number) {
    const length = this.state.length;
    this.state[i][j] = playerId;
    let str = this.state[i].reduce((s, e) => s + e, "");
    if (
      RegExp(`(0*)(${playerId}+)(${opponent}+)(${playerId}+)(0*)`).test(str)
    ) {
      for (let j = 0; j < length; j++) {
        let e = this.state[i][j];
        this.state[i][j] = e !== 0 && e !== playerId ? playerId : e;
      }
    }
    str = this.getColumn(j).reduce((s, e) => s + e, "");
    if (
      RegExp(`(0*)(${playerId}+)(${opponent}+)(${playerId}+)(0*)`).test(str)
    ) {
      for (let i = 0; i < length; i++) {
        let e = this.state[i][j];
        this.state[i][j] = e !== 0 && e !== playerId ? playerId : e;
      }
    }

    // TODO: flip diagonal
    const position = this.state.length + (i - j) - 1;
    const diag1 = this.getDiagonals(this.state)[position];
    str = diag1.reduce((s, e) => s + e, "");
    if (
      RegExp(`(0*)(${playerId}+)(${opponent}+)(${playerId}+)(0*)`).test(str)
    ) {
      for (let j = 0; j < diag1.length; j++) {
        let e = diag1[j];
        diag1[j] = e !== 0 && e !== playerId ? playerId : e;
      }
      this.setDiagonal(diag1, position + 1);
    }

    {
      // TODO: flip diagonal
      const position = i + j;
      const diag1 = this.getDiagonals(this.state.map(a => a.slice().reverse()))[
        position
      ];
      console.log("position", position);
      console.log("diag1", diag1);

      str = diag1.reduce((s, e) => s + e, "");
      if (
        RegExp(`(0*)(${playerId}+)(${opponent}+)(${playerId}+)(0*)`).test(str)
      ) {
        for (let j = 0; j < diag1.length; j++) {
          let e = diag1[j];
          diag1[j] = e !== 0 && e !== playerId ? playerId : e;
        }
        this.state = this.state.map(a => a.slice().reverse());
        this.setDiagonal(diag1, position + 1);
        this.state = this.state.map(a => a.slice().reverse());
      }
    }
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
      for (let i = 0; i < l; i++) {
        arr[i][i] = arr2[i];
      }
    }
    if (i > l) {
      for (let j = 0; i - l + j < l; j++) {
        arr[i - l + j][j] = arr2[j];
      }
    }
  }
}
